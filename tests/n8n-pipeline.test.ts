import {it,expect,vi,afterEach} from 'vitest';
vi.mock('../automation/network',()=>({safeFetch:vi.fn(async()=>({status:200,body:'<p>The company announced an update.</p><a href="https://primary.example/statement"></a>',headers:{}}))}));
import {pipeline} from '../automation/n8n/pipeline';
import {requiredChecks,validateCandidate} from '../automation/publisher';
const id='a'.repeat(64),sourceUrl='https://example.org/news';
const draft={section:'ai',editions:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{title:'Update',summary:'A factual update.',slug:'update-'+l.toLowerCase(),paragraphs:['An original factual brief.','The company announced an update.']}])),evidence:[{url:sourceUrl,quote:'The company announced an update.'}]};
const illustration='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630"><rect width="1200" height="630" fill="#f5f0e6"/><circle cx="500" cy="315" r="150" fill="#cc2032"/><path d="M100 500L1100 130" fill="none" stroke="#171717" stroke-width="20"/></svg>';
function harness({approved=true,primary=true,duplicate=false,badIdentity=false,imageAvailable=true,queueEmpty=false}={}){
 const calls:{url:string;body:any}[]=[];const config={workerUrl:'https://worker.test',writerToken:'writer-secret',agentUrl:'http://codex',agentToken:'agent-secret',validationSecret:'s'.repeat(48),sources:[{id:'fixture',url:'https://example.org/rss',automation_enabled:true,rights_status:'reviewed',allowed_reuse:'metadata-discovery',proposed_poll_minutes:5,classification:'ai-primary'}],projectId:'fixture',dataset:'production'};
 vi.stubGlobal('fetch',vi.fn(async(input:any,init:any={})=>{
  const url=String(input),body=init.body?JSON.parse(init.body):null;calls.push({url,body});
  if(url.endsWith('/claim'))return Response.json(queueEmpty?{job:null}:{jobId:id,leaseToken:'lease',leaseUntil:Date.now()+300000,item:{url:sourceUrl,publishedAt:new Date().toISOString()}});
  if(url.includes('.api.sanity.io'))return Response.json({result:duplicate?[{sources:[sourceUrl]}]:[]});
  if(url.endsWith('/v1/task')){
   expect(JSON.stringify(body)).not.toContain(config.writerToken);expect(JSON.stringify(body)).not.toContain(config.validationSecret);
   if(body.task==='research')return Response.json({primaryUrls:[],reason:'Primary already supplied'});
   if(body.task==='write')return Response.json(draft);
   if(body.task==='illustrate')return Response.json({svg:illustration});
   return Response.json({...Object.fromEntries(requiredChecks.filter(k=>k!=='sourceRights').map(k=>[k,true])),claimsVerified:approved,primaryEvidence:primary,reason:'Independent judgment'});
  }
  if(url.endsWith('/v1/images/resolve'))return Response.json({image:imageAvailable?{kind:'source',provider:'commons',url:'https://upload.wikimedia.org/wikipedia/commons/1/2a/technology-data-center.jpg',alt:'A semiconductor research facility',credit:'Photo by A. Photographer on Wikimedia Commons',license:'CC BY 4.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Technology_data_center.jpg',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'}:null});
  if(url.startsWith('https://commons.wikimedia.org/w/api.php'))return Response.json({query:{pages:imageAvailable?[{title:'File:Technology data center.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/1/2a/technology-data-center.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Technology_data_center.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'A. Photographer'},ImageDescription:{value:'A real technology data center photograph.'}}}]}]:[]}});
  if(url.endsWith('/hold'))return Response.json({held:id});
  if(url.endsWith('/publish')){validateCandidate(body.candidate,config.validationSecret);return Response.json({published:badIdentity?'story-wrong':'story-'+id});}
  throw Error('Unexpected outbound request');
 }));
 return {run:pipeline(config),calls,config};
}
afterEach(()=>vi.unstubAllGlobals());
it('repairs the newest outdated published image first when the queue is idle',async()=>{
 const {run,calls}=harness({queueEmpty:true});expect(await run('queue')).toEqual({state:'idle'});
 const query=new URL(calls.find(c=>c.url.includes('.api.sanity.io'))!.url).searchParams.get('query')||'';
 expect(query).toContain('order(publishedAt desc)');expect(query).toContain('editorialImageRevision');
});
it('separates writing, fresh review and signed publication without leaking service credentials',async()=>{
 const {run,calls}=harness();expect(await run('queue')).toMatchObject({state:'published',documentId:'story-'+id});
 expect(calls.find(c=>c.url.endsWith('/publish'))?.body.image).toMatchObject({kind:'source',provider:'commons',license:'CC BY 4.0'});
 expect(calls.filter(c=>c.url.endsWith('/v1/task')).map(c=>c.body.task)).toEqual(['research','write','review']);
 expect(calls.filter(c=>c.url.endsWith('/publish'))).toHaveLength(1);
});
it('generates a validated Codex illustration when no suitable photo is available',async()=>{
 const {run,calls}=harness({imageAvailable:false});expect(await run('queue')).toMatchObject({state:'published',documentId:'story-'+id});
 expect(calls.find(c=>c.url.endsWith('/publish'))?.body.image).toMatchObject({kind:'generated',credit:'Token on Air · Editorial illustration',license:'© Token on Air'});
 expect(calls.filter(c=>c.url.endsWith('/v1/task')).map(c=>c.body.task)).toEqual(['research','write','review','illustrate']);
 expect(calls.some(c=>c.url.endsWith('/hold'))).toBe(false);
});
it('never publishes failed independent verification',async()=>{
 for(const options of [{approved:false},{primary:false}]){const {run,calls}=harness(options);expect(await run('queue')).toMatchObject({state:'held'});expect(calls.some(c=>c.url.endsWith('/publish'))).toBe(false);}
});
it('holds known source duplicates without calling the model',async()=>{
 const {run,calls}=harness({duplicate:true});expect(await run('queue')).toMatchObject({state:'held'});expect(calls.some(c=>c.url.endsWith('/v1/task'))).toBe(false);
});
it('refuses a mismatched publication identity instead of recording success',async()=>{
 const {run}=harness({badIdentity:true});expect(await run('queue')).toMatchObject({state:'held'});
});
it('never claims with no reviewed source policy',async()=>{
 const {config,calls}=harness();config.sources[0].automation_enabled=false;expect(await pipeline(config)('queue')).toMatchObject({state:'paused'});expect(calls).toEqual([]);
});
it('does not implicitly approve primary evidence from an unreviewed host',async()=>{
 const {config,calls}=harness();config.sources[0].classification='ai-newsroom';
 config.sources.push({...config.sources[0],id:'unapproved',url:'https://primary.example/rss',classification:'ai-primary',automation_enabled:false,rights_status:'terms_review_pending',allowed_reuse:'none_granted'});
 const previous=globalThis.fetch;
 vi.stubGlobal('fetch',vi.fn(async(url:any,init:any)=>{
  const body=init?.body?JSON.parse(init.body):null;
  if(body?.task==='research')return Response.json({primaryUrls:['https://primary.example/statement'],reason:'Untrusted suggestion'});
  return previous(url,init);
 }));
 await pipeline(config)('queue');expect(calls.some(c=>c.body?.task==='write')).toBe(false);expect(calls.some(c=>c.url.endsWith('/publish'))).toBe(false);
});
it('durably holds verifier-rejected jobs instead of leaving an expiring lease',async()=>{
 const {run,calls}=harness({approved:false});expect(await run('queue')).toMatchObject({state:'held',jobId:id});expect(calls.some(c=>c.url.endsWith('/hold'))).toBe(true);
});
it('quarantines ambiguous publication failure, and halts if hold cannot be confirmed',async()=>{
 const {config}=harness();const previous=globalThis.fetch;
 vi.stubGlobal('fetch',vi.fn(async(url:any,init:any)=>{if(String(url).endsWith('/publish')||String(url).endsWith('/hold'))throw Error('Network lost');return previous(url,init);}));
 expect(await pipeline(config)('queue')).toMatchObject({state:'needs-attention',jobId:id});
});
it('does not treat licensed PANews reporting as primary evidence for another source job',async()=>{
 const {config,calls}=harness();(config.sources as any[]).push({id:'panews',url:'https://www.panewslab.com/rss.xml',classification:'crypto-newsroom',automation_enabled:true,rights_status:'reviewed',allowed_reuse:'metadata-discovery',proposed_poll_minutes:5,review:{permission_status:'owner-confirmed'}});
 await pipeline(config)('queue');expect(calls.find(c=>c.body?.task==='research')?.body.input.primaryHosts).not.toContain('www.panewslab.com');
});
it('holds source stories older than the approved 48-hour window before generation',async()=>{
 const {config,calls}=harness();const previous=globalThis.fetch;
 vi.stubGlobal('fetch',vi.fn(async(url:any,init:any)=>String(url).endsWith('/claim')?Response.json({jobId:id,leaseToken:'lease',leaseUntil:Date.now()+300000,item:{url:sourceUrl,publishedAt:new Date(Date.now()-49*3600000).toISOString()}}):previous(url,init)));
 expect(await pipeline(config)('queue')).toMatchObject({state:'held'});expect(calls.some(c=>c.body?.task==='write')).toBe(false);
});
