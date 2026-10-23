import {it,expect,vi,afterEach} from 'vitest';
vi.mock('../automation/network',()=>({safeFetch:vi.fn(async()=>({status:200,body:'<p>The company announced an update.</p><a href="https://primary.example/statement"></a>',headers:{}}))}));
import {pipeline} from '../automation/n8n/pipeline';
import {requiredChecks,validateCandidate} from '../automation/publisher';
const id='a'.repeat(64),sourceUrl='https://example.org/news';
const draft={section:'ai',editions:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{title:'Update',summary:'A factual update.',slug:'update-'+l.toLowerCase(),paragraphs:['An original factual brief.','The company announced an update.']}])),evidence:[{url:sourceUrl,quote:'The company announced an update.'}]};
function harness({approved=true,primary=true,duplicate=false,badIdentity=false}={}){
 const calls:{url:string;body:any}[]=[];const config={workerUrl:'https://worker.test',writerToken:'writer-secret',agentUrl:'http://codex',agentToken:'agent-secret',validationSecret:'s'.repeat(48),sources:[{id:'fixture',url:'https://example.org/rss',automation_enabled:true,rights_status:'reviewed',allowed_reuse:'metadata-discovery',proposed_poll_minutes:5,classification:'ai-primary'}],projectId:'fixture',dataset:'production'};
 vi.stubGlobal('fetch',vi.fn(async(input:any,init:any={})=>{
  const url=String(input),body=init.body?JSON.parse(init.body):null;calls.push({url,body});
  if(url.endsWith('/claim'))return Response.json({jobId:id,leaseToken:'lease',leaseUntil:Date.now()+300000,item:{url:sourceUrl,publishedAt:new Date().toISOString()}});
  if(url.includes('.api.sanity.io'))return Response.json({result:duplicate?[{sources:[sourceUrl]}]:[]});
  if(url.endsWith('/v1/task')){
   expect(JSON.stringify(body)).not.toContain(config.writerToken);expect(JSON.stringify(body)).not.toContain(config.validationSecret);
   if(body.task==='write')return Response.json(draft);
   return Response.json({...Object.fromEntries(requiredChecks.filter(k=>k!=='sourceRights').map(k=>[k,true])),claimsVerified:approved,primaryEvidence:primary,reason:'Independent judgment'});
  }
  if(url.endsWith('/hold'))return Response.json({held:id});
  if(url.endsWith('/publish')){validateCandidate(body.candidate,config.validationSecret);return Response.json({published:badIdentity?'story.wrong':'story.'+id});}
  throw Error('Unexpected outbound request');
 }));
 return {run:pipeline(config),calls,config};
}
afterEach(()=>vi.unstubAllGlobals());
it('separates writing, fresh review and signed publication without leaking service credentials',async()=>{
 const {run,calls}=harness();expect(await run('queue')).toMatchObject({state:'published',documentId:'story.'+id});
 expect(calls.filter(c=>c.url.endsWith('/v1/task')).map(c=>c.body.task)).toEqual(['write','review']);
 expect(calls.filter(c=>c.url.endsWith('/publish'))).toHaveLength(1);
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
