import {it,expect,vi} from 'vitest';
import worker,{runScheduled} from '../workers/news/index';
import {D1Store} from '../workers/news/store';
import {testDB} from './fixtures/d1';
import {fetchFeed} from '../workers/news/network';
import {candidateHash,requiredChecks,signReport} from '../automation/publisher';
import {rawArticle} from './fixtures/articles';
const token='w'.repeat(40),admin='a'.repeat(40),secret='s'.repeat(40);
const envFor=(db:any)=>({DB:db,WRITER_TOKEN:token,ADMIN_TOKEN:admin,VALIDATION_SECRET:secret,AUTOMATION_ENABLED:'1',AUTOMATION_KILL_SWITCH:'0',IMAGE_MAINTENANCE_ENABLED:'1',SANITY_PROJECT_ID:'4k0o7q9m',SANITY_DATASET:'production',SANITY_EDITOR_ID:'editor-jienweng',SANITY_WRITE_TOKEN:'private-token'});
const request=(path:string,body:any={},key=token)=>{const image={url:'https://upload.wikimedia.org/wikipedia/commons/a/ab/Technology.jpg',alt:'A real technology photograph',credit:'Photo by A. Photographer on Wikimedia Commons',license:'CC BY 4.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Technology.jpg',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',provider:'commons',kind:'source'};const payload=path.endsWith('/publish')&&body.candidate&&!Object.hasOwn(body,'image')?{...body,image}:body;return new Request('https://worker.test'+path,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload)});};
const ethereumPhoto=()=>Response.json({query:{pages:[{title:'File:Close-up of a physical Ethereum coin (51002904687).jpg',imageinfo:[{thumburl:'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/ethereum.jpg/1280px-ethereum.jpg?utm_source=commons',width:6048,height:4024,descriptionurl:'https://commons.wikimedia.org/wiki/File:Close-up_of_a_physical_Ethereum_coin_(51002904687).jpg',extmetadata:{LicenseShortName:{value:'CC BY 2.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/2.0'},Artist:{value:'<a>Ivan Radic</a>'},ImageDescription:{value:'Close-up photograph of a physical Ethereum coin.'}}}]}]}});
export function signedCandidate(url:string){const now=new Date().toISOString(),raw=rawArticle({sources:[url],publishedAt:now,updatedAt:now});const article={...raw,translations:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{title:'Story',summary:'Story',slug:'stable-story',body:raw.body}]))};const evidence=[{url,quote:'Evidence',contentHash:'a'.repeat(64)}];return {article,evidence,report:signReport(candidateHash({article,evidence}),Object.fromEntries(requiredChecks.map(c=>[c,true])),now,secret)};}
async function setup(){const {db,sqlite}=testDB();sqlite.exec("INSERT INTO sources(id,url,automation_enabled,rights_status,allowed_reuse) VALUES('openai','https://openai.com/news/rss.xml',1,'reviewed','metadata-discovery')");const store=new D1Store(db);const item={title:'Original event',url:'https://openai.com/index/example',publishedAt:new Date(Date.now()-3600000).toISOString(),fingerprint:'b'.repeat(64)};await store.enqueue('openai',item);return {db,sqlite,store,item,env:envFor(db)};}
it('authenticates before touching data and keeps paused schedules inert',async()=>{
 const env=envFor({prepare:()=>{throw Error('DB must not be touched');}});env.AUTOMATION_ENABLED='0';
 expect((await worker.fetch(new Request('https://worker.test/health'),env)).status).toBe(200);
 expect((await worker.fetch(request('/v1/jobs/claim',{},'wrong'),env)).status).toBe(401);
 expect((await worker.fetch(request('/v1/jobs/claim'),env)).status).toBe(503);
 expect(await runScheduled(env,vi.fn())).toEqual({paused:true});
});
it('runs explicitly enabled image maintenance while news publishing remains paused',async()=>{
 const {env,store,item}=await setup();env.AUTOMATION_ENABLED='0';env.AUTOMATION_KILL_SWITCH='1';env.RSS_POLLING_ENABLED='0';env.IMAGE_MAINTENANCE_ENABLED='1';
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({result:[]}));
 try{
  await worker.scheduled({cron:'* * * * *',scheduledTime:Date.parse('2026-10-23T17:45:00.000Z')},env);
  expect(get).toHaveBeenCalledOnce();expect(String(get.mock.calls[0][0])).toContain('/data/query/production');
  expect((await store.get(item.fingerprint))?.state).toBe('queued');
 }finally{get.mockRestore();}
});
it('rejects browser cross-origin posts, oversized bodies and malformed claims',async()=>{
 const {env}=await setup();const cross=request('/v1/jobs/claim');cross.headers.set('Origin','https://evil.test');expect((await worker.fetch(cross,env)).status).toBe(403);
 expect((await worker.fetch(request('/v1/jobs/claim',{x:'x'.repeat(66000)}),env)).status).toBe(413);
 expect((await worker.fetch(request('/v1/jobs/not-an-id/publish'),env)).status).toBe(404);
});
it('claims once, requires independent validation, holds bad candidates and can release administratively',async()=>{
 const {env,store,item}=await setup();let r=await worker.fetch(request('/v1/jobs/claim'),env);const claim=await r.json() as any;
 expect(claim.item.publishedAt).toBe(item.publishedAt);expect(claim.instructions).toContain('UNTRUSTED');
 expect((await(await worker.fetch(request('/v1/jobs/claim'),env)).json())).toEqual({job:null});
 r=await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/publish',{leaseToken:claim.leaseToken,candidate:{}}),env);expect(r.status).toBe(422);expect((await store.get(item.fingerprint))?.state).toBe('held');
 expect((await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/release',{},token),env)).status).toBe(401);
 expect((await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/release',{},admin),env)).status).toBe(200);
});
it('requires an approved source photograph before publishing an article',async()=>{
 const {env,store,item}=await setup();const claim=await(await worker.fetch(request('/v1/jobs/claim'),env)).json() as any;
 const r=await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/publish',{leaseToken:claim.leaseToken,candidate:signedCandidate(item.url),image:null}),env);
 expect(r.status).toBe(422);expect((await store.get(item.fingerprint))?.state).toBe('held');
});
it('keeps Sanity identity and import dates fixed and recovers an uncertain write',async()=>{
 const {env,store,item}=await setup();const claim=await(await worker.fetch(request('/v1/jobs/claim'),env)).json() as any;
 const input={leaseToken:claim.leaseToken,candidate:signedCandidate(item.url)};let saved:any;let calls=0;
 const get=vi.spyOn(globalThis,'fetch').mockImplementation(async(url,init)=>{
  calls++;if(String(url).includes('/data/query/'))return Response.json({result:String(url).includes('count(')||String(url).includes('count%28')?0:saved||null});if(String(url).includes('/assets/images/'))return Response.json({document:{_id:'image-'+'a'.repeat(40)+'-1200x630-jpg'}});
  const body=JSON.parse(init!.body as string);saved=body.mutations[0].createIfNotExists;throw Error('Connection lost after commit');
 });
 try{
  expect((await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/publish',input),env)).status).toBe(502);
  expect(saved._id).toBe('story-'+item.fingerprint);expect(saved.provenance.sourcePublishedAt).toBe(item.publishedAt);expect(Date.parse(saved.publishedAt)).toBeGreaterThan(Date.parse(item.publishedAt));
  await store.release(item.fingerprint);const reclaim=await(await worker.fetch(request('/v1/jobs/claim'),env)).json() as any;
  expect((await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/publish',{...input,leaseToken:reclaim.leaseToken}),env)).status).toBe(200);
  const before=calls;expect((await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/publish',input),env)).status).toBe(200);expect(calls).toBe(before);
 }finally{get.mockRestore();}
});
it('bounds feed network reads and never follows an unapproved redirect',async()=>{
 const source={id:'openai',url:'https://openai.com/news/rss.xml',resolved_url:null};
 const redirect=vi.fn().mockResolvedValue(new Response(null,{status:302,headers:{Location:'https://evil.test/rss'}}));
 await expect(fetchFeed(source,{},redirect)).rejects.toThrow();expect(redirect).toHaveBeenCalledTimes(1);
 await expect(fetchFeed(source,{},vi.fn().mockResolvedValue(new Response('x'.repeat(66000))))).rejects.toThrow();
 await expect(fetchFeed({...source,url:'https://127.0.0.1/rss'}, {},vi.fn())).rejects.toThrow();
});
it('polls one reviewed due source and deduplicates metadata across repeated schedules',async()=>{
 const {env,store,sqlite}=await setup();const date=new Date().toUTCString();const feed=`<rss><channel><item><title>New</title><link>https://openai.com/index/new</link><pubDate>${date}</pubDate></item></channel></rss>`;
 const get=vi.fn().mockResolvedValue({status:200,headers:new Headers({etag:'v1'}),body:feed});
 await runScheduled(env,get);await runScheduled(env,get);expect(get).toHaveBeenCalledTimes(1);
 expect(sqlite.prepare('SELECT count(*) AS n FROM jobs').get()?.n).toBe(2);expect((await store.status()).sources[0].last_success).toBeTruthy();
});
it('cannot hold another owner’s job by submitting invalid content with the wrong lease',async()=>{
 const {env,store,item}=await setup();const claim=await(await worker.fetch(request('/v1/jobs/claim'),env)).json() as any;
 const r=await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/publish',{leaseToken:'wrong',candidate:{}}),env);
 expect(r.status).toBe(409);expect((await store.get(item.fingerprint))?.state).toBe('processing');expect(await store.owned(item.fingerprint,claim.leaseToken)).toBeTruthy();
});
it('recovers uncertain correction and withdrawal commits without changing first publication or slugs',async()=>{
 const {env,store,item}=await setup();const candidate=signedCandidate(item.url);const validatedHash=candidateHash({article:candidate.article,evidence:candidate.evidence});
 let saved:any={_id:'story-'+item.fingerprint,_rev:'rev1',publicationState:'published',publishedAt:candidate.article.publishedAt,updatedAt:candidate.article.updatedAt,translations:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{slug:{current:'stable-story'}}])),corrections:[],automation:{candidateHash:validatedHash},provenance:{sourcePublishedAt:item.publishedAt}};
 const claim=await store.claim();await store.published(item.fingerprint,claim!.lease_token,validatedHash);
 const corrected=structuredClone(candidate);corrected.article.updatedAt=new Date(Date.parse(candidate.article.updatedAt)+1).toISOString();corrected.article.corrections=[{date:corrected.article.updatedAt,notes:{en:'Correction',zh:'更正',zhCn:'更正'}}] as any;
 corrected.report=signReport(candidateHash({article:corrected.article,evidence:corrected.evidence}),Object.fromEntries(requiredChecks.map(c=>[c,true])),new Date().toISOString(),secret);
 const get=vi.spyOn(globalThis,'fetch').mockImplementation(async(url,init)=>{
  if(String(url).includes('/data/query/'))return Response.json({result:saved});
  const patch=JSON.parse(init!.body as string).mutations[0].patch;expect(patch.ifRevisionID).toBe(saved._rev);
  saved={...saved,...patch.set,_rev:'rev'+Date.now()};throw Error('Unknown remote outcome');
 });
 try{
  const correctionRequest=()=>request('/v1/jobs/'+item.fingerprint+'/correct',{candidate:corrected},admin);
  expect((await worker.fetch(correctionRequest(),env)).status).toBe(502);
  expect((await worker.fetch(correctionRequest(),env)).status).toBe(200);
  expect(saved.publishedAt).toBe(candidate.article.publishedAt);expect(saved.provenance.sourcePublishedAt).toBe(item.publishedAt);
  const withdrawRequest=()=>request('/v1/jobs/'+item.fingerprint+'/withdraw',{},admin);
  expect((await worker.fetch(withdrawRequest(),env)).status).toBe(502);
  expect((await worker.fetch(withdrawRequest(),env)).status).toBe(200);
  expect((await store.get(item.fingerprint))?.state).toBe('withdrawn');
 }finally{get.mockRestore();}
});
it('handles a 50-item feed within the Free plan query budget',async()=>{
 const {env,db,sqlite}=await setup();let queries=0;
 const original=db.prepare;db.prepare=(sql:string)=>{if(++queries>50)throw Error('Free query cap');return original(sql);};
 const date=new Date().toUTCString();const body='<rss><channel>'+Array.from({length:50},(_,i)=>`<item><title>News ${i}</title><link>https://openai.com/index/batch-${i}</link><pubDate>${date}</pubDate></item>`).join('')+'</channel></rss>';
 await expect(runScheduled(env,vi.fn().mockResolvedValue({status:200,headers:new Headers(),body}))).resolves.toMatchObject({discovered:50});
 expect(queries).toBeLessThan(10);expect(sqlite.prepare('SELECT count(*) AS n FROM jobs').get()?.n).toBe(51);
});
it('reserves slugs across jobs even when a remote write commits after a timeout',async()=>{
 const {env,store,item}=await setup();const first=await(await worker.fetch(request('/v1/jobs/claim'),env)).json() as any;let writes=0;const pending:any[]=[];
 const get=vi.spyOn(globalThis,'fetch').mockImplementation(async(url,init)=>{
  if(String(url).includes('/data/query/'))return Response.json({result:String(url).includes('count(')||String(url).includes('count%28')?0:null});if(String(url).includes('/assets/images/'))return Response.json({document:{_id:'image-'+'b'.repeat(40)+'-1200x630-jpg'}});
  writes++;pending.push(JSON.parse(init!.body as string).mutations[0].createIfNotExists);throw Error('Timeout before remote commit');
 });
 try{
  const candidate=signedCandidate(item.url);
  expect((await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/publish',{leaseToken:first.leaseToken,candidate}),env)).status).toBe(502);
  const secondItem={...item,url:'https://openai.com/index/second',fingerprint:'c'.repeat(64)};await store.enqueue('openai',secondItem);
  const second=await(await worker.fetch(request('/v1/jobs/claim'),env)).json() as any;
  expect((await worker.fetch(request('/v1/jobs/'+secondItem.fingerprint+'/publish',{leaseToken:second.leaseToken,candidate:signedCandidate(secondItem.url)}),env)).status).toBe(409);
  expect(writes).toBe(1);expect(pending).toHaveLength(1);
 }finally{get.mockRestore();}
});
it('lets only the lease owner durably quarantine rejected work, including after lease expiry',async()=>{
 const {env,store,item,sqlite}=await setup();const claim=await(await worker.fetch(request('/v1/jobs/claim'),env)).json() as any;
 const path='/v1/jobs/'+item.fingerprint+'/hold';
 expect((await worker.fetch(request(path,{leaseToken:'wrong'}),env)).status).toBe(409);
 sqlite.prepare('UPDATE jobs SET lease_until=0 WHERE id=?').run(item.fingerprint);
 expect((await worker.fetch(request(path,{leaseToken:claim.leaseToken}),env)).status).toBe(200);
 expect((await store.get(item.fingerprint))?.state).toBe('held');expect(await store.claim(Date.now()+360000)).toBeNull();
 expect((await worker.fetch(request(path,{leaseToken:claim.leaseToken}),env)).status).toBe(200);
});
it('accepts only bounded canonical fresh metadata from the fixed reviewed source',async()=>{
 const {env,store,item,sqlite}=await setup();const path='/v1/ingest';const fresh={...item,url:'https://openai.com/index/ingest',fingerprint:''};fresh.fingerprint=(await import('node:crypto')).createHash('sha256').update(fresh.url).digest('hex');
 expect((await worker.fetch(request(path,{source:'openai',items:[fresh]},'wrong'),env)).status).toBe(401);
 expect((await worker.fetch(request(path,{source:'openai',items:[fresh]}),env)).status).toBe(200);
 expect((await store.get(fresh.fingerprint))?.state).toBe('queued');
 for(const bad of [{...fresh,fingerprint:'a'.repeat(64)},{...fresh,url:'https://evil.test/a'},{...fresh,publishedAt:'2020-01-01T00:00:00Z'}])expect((await worker.fetch(request(path,{source:'openai',items:[bad]}),env)).status).toBe(422);
 expect((await worker.fetch(request(path,{source:'openai',items:Array(51).fill(fresh)}),env)).status).toBe(422);
 sqlite.prepare("UPDATE sources SET automation_enabled=0 WHERE id='openai'").run();expect((await worker.fetch(request(path,{source:'openai',items:[fresh]}),env)).status).toBe(409);
});
it('repairs only an authenticated published legacy private ID with matching signed identity',async()=>{
 const {env,store,item,sqlite}=await setup();const old='story.'+item.fingerprint,next='story-'+item.fingerprint;
 sqlite.prepare("UPDATE jobs SET state='published',document_id=?,candidate_hash='verified-hash' WHERE id=?").run(old,item.fingerprint);
 const route='/v1/jobs/'+item.fingerprint+'/repair-public-id';
 expect((await worker.fetch(request(route,{},token),env)).status).toBe(401);
 const original={_id:old,_rev:'revision',_type:'article',publicationState:'published',publishedAt:'2026-10-23T01:00:00Z',automation:{candidateHash:'verified-hash'},translations:{en:{slug:{current:'unchanged'}}}};let mutations:any;
 vi.stubGlobal('fetch',vi.fn(async(input:any,init:any)=>{const url=new URL(String(input));if(url.pathname.includes('/query/')){const id=JSON.parse(url.searchParams.get('$id')!);return Response.json({result:id===old?original:null});}mutations=JSON.parse(init.body).mutations;return Response.json({results:[{document:{...original,_id:next}}]});}));
 try{const r=await worker.fetch(request(route,{},admin),env);expect(r.status).toBe(200);expect(await r.json()).toEqual({repaired:next});expect((await store.get(item.fingerprint))?.document_id).toBe(next);expect(mutations.find((m:any)=>m.createIfNotExists)?.createIfNotExists).toMatchObject({_id:next,publishedAt:original.publishedAt,translations:original.translations});expect(mutations.some((m:any)=>m.patch?.ifRevisionID==='revision')).toBe(true);expect(mutations.some((m:any)=>m.delete?.id===old)).toBe(true);}finally{vi.unstubAllGlobals();}
});
it('refuses mismatched public-ID repair and allows safe retry after a completed CMS transaction',async()=>{
 const {env,item}=await setup();const {sanityApi}=await import('../workers/news/sanity');let writes=0,old:any=null,current:any={_id:'story-'+item.fingerprint,_type:'article',publicationState:'published',automation:{candidateHash:'expected'}};
 vi.stubGlobal('fetch',vi.fn(async(input:any,init:any)=>{if(init?.method==='POST'){writes++;throw Error('No write expected');}const u=new URL(String(input)),id=JSON.parse(u.searchParams.get('$id')!);return Response.json({result:id.startsWith('story.')?old:current});}));
 try{expect(await sanityApi(env).repairPublicId(item.fingerprint,'expected')).toBe(current._id);current.automation.candidateHash='other';await expect(sanityApi(env).repairPublicId(item.fingerprint,'expected')).rejects.toThrow('Public identity collision');current=null;old={_id:'story.'+item.fingerprint,_rev:'rev',_type:'article',publicationState:'published',automation:{candidateHash:'other'}};await expect(sanityApi(env).repairPublicId(item.fingerprint,'expected')).rejects.toThrow('Legacy identity mismatch');expect(writes).toBe(0);}finally{vi.unstubAllGlobals();}
});
it('attaches real Sanity assets only through an admin, preserves selected images and replays safely',async()=>{
 const {env,store,item}=await setup();const lease=await store.claim();await store.published(item.fingerprint,lease!.lease_token,'expected');
 let doc:any={_id:'story-'+item.fingerprint,_type:'article',_rev:'rev1',publicationState:'published',automation:{jobId:item.fingerprint,candidateHash:'expected'},provenance:{sourceUrl:'https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay'},translations:{en:{title:'Ethereum postpones Hoodi Glamsterdam upgrade',slug:{current:'published-headline'}}},publishedAt:'2026-10-23T00:00:00Z'};
 const asset='image-'+'c'.repeat(40)+'-1200x630-png';let uploads=0,patches=0;
 vi.stubGlobal('fetch',vi.fn(async(url,init)=>{
  if(String(url).includes('commons.wikimedia.org/w/api.php'))return ethereumPhoto();
  if(String(url).includes('/data/query/'))return Response.json({result:doc});
  if(String(url).includes('/assets/images/')){uploads++;const body=JSON.parse(init!.body as string);expect(body.url).toBe('https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/ethereum.jpg/1280px-ethereum.jpg');return Response.json({document:{_id:asset}});}
  const patch=JSON.parse(init!.body as string).mutations[0].patch;patches++;expect(patch.ifRevisionID).toBe('rev1');expect(Object.keys(patch.set)).toEqual(['mainImage']);doc={...doc,...patch.set,_rev:'rev2'};return Response.json({results:[{document:doc}]});
 }));
 try{
  const path='/v1/jobs/'+item.fingerprint+'/attach-image';expect((await worker.fetch(request(path),env)).status).toBe(401);expect(uploads).toBe(0);
  const first=await worker.fetch(request(path,{},admin),env);expect(first.status).toBe(200);
  expect(doc.mainImage.asset).toEqual({_type:'reference',_ref:asset});expect(doc.mainImage.alt).toContain('physical Ethereum coin');expect(doc.mainImage.credit).toBe('Photo by Ivan Radic on Wikimedia Commons');expect(doc.publishedAt).toBe('2026-10-23T00:00:00Z');
  expect((await worker.fetch(request(path,{},admin),env)).status).toBe(200);expect(uploads).toBe(1);expect(patches).toBe(1);
  doc.mainImage={...doc.mainImage,asset:{_ref:'chosen-photo'},credit:'Photographer'};
  doc.translations.en.title='Corrected headline';
  expect((await worker.fetch(request(path,{},admin),env)).status).toBe(200);expect(uploads).toBe(1);
 }finally{vi.unstubAllGlobals();}
});
it('refuses attaching media when the published CMS identity differs from the job',async()=>{
 const {env,store,item}=await setup();const lease=await store.claim();await store.published(item.fingerprint,lease!.lease_token,'expected');
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({result:{_id:'story-'+item.fingerprint,_type:'article',_rev:'r',publicationState:'published',automation:{candidateHash:'different'}}}));
 try{expect((await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/attach-image',{},admin),env)).status).toBe(409);expect(get).toHaveBeenCalledTimes(1);}finally{get.mockRestore();}
});
it('keeps image retries bounded to five-minute ticks without resuming news polling',async()=>{
 const {env}=await setup();const e={...env,RSS_POLLING_ENABLED:'0'};
 const get=vi.spyOn(globalThis,'fetch').mockImplementation(async()=>Response.json({result:[]}));
 try{
  await worker.scheduled({cron:'* * * * *',scheduledTime:60000},e);expect(get).not.toHaveBeenCalled();
  await worker.scheduled({cron:'* * * * *',scheduledTime:300000},e);expect(get).toHaveBeenCalledTimes(1);
  await worker.scheduled({cron:'* * * * *',scheduledTime:600000},{...e,AUTOMATION_KILL_SWITCH:'1'});expect(get).toHaveBeenCalledTimes(2);expect(get.mock.calls.every(([url])=>String(url).includes('/data/query/production'))).toBe(true);
 }finally{get.mockRestore();}
});
it('refuses unexpected uploaded assets without patching or holding a published job',async()=>{
 const {env,store,item}=await setup();const lease=await store.claim();await store.published(item.fingerprint,lease!.lease_token,'expected');
 const doc={_id:'story-'+item.fingerprint,_type:'article',_rev:'r',publicationState:'published',automation:{candidateHash:'expected'},provenance:{sourceUrl:'https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay'},translations:{en:{title:'Ethereum postpones Hoodi Glamsterdam upgrade',slug:{current:'published'}}}};
 const get=vi.spyOn(globalThis,'fetch').mockImplementation(async url=>String(url).includes('commons.wikimedia.org/w/api.php')?ethereumPhoto():Response.json(String(url).includes('/data/query/')?{result:doc}:{document:{_id:'file-unknown-pdf'}}));
 try{expect((await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/attach-image',{},admin),env)).status).toBe(502);expect(get).toHaveBeenCalledTimes(4);expect(get.mock.calls.some(([url])=>String(url).includes('/mutate/'))).toBe(false);expect((await store.get(item.fingerprint))?.state).toBe('published');}finally{get.mockRestore();}
});

it('backs off a failed image so a later published article can proceed on the next tick',async()=>{
 const {env,store,item}=await setup();const lease=await store.claim();await store.published(item.fingerprint,lease!.lease_token,'expected');
 const second='d'.repeat(64);await store.enqueue('openai',{...item,fingerprint:second,url:'https://openai.com/index/second'});const claim=await store.claim();await store.published(second,claim!.lease_token,'second');
 let queries=0;const get=vi.spyOn(globalThis,'fetch').mockImplementation(async input=>{
  const url=new URL(String(input));
  if(url.searchParams.has('$excluded')){const excluded=JSON.parse(url.searchParams.get('$excluded')!);queries++;expect(excluded).toEqual(queries===1?[]:[item.fingerprint]);return Response.json({result:[{jobId:queries===1?item.fingerprint:second}]});}
  if(url.pathname.includes('/assets/'))throw Error('First image unavailable');
  const id=JSON.parse(url.searchParams.get('$id')!);return Response.json({result:{_id:id,_type:'article',_rev:'r',publicationState:'published',automation:{candidateHash:id.endsWith(second)?'second':'expected'},translations:{en:{title:'Title',slug:{current:'valid'}}},mainImage:id.endsWith(second)?{asset:{_ref:'chosen'}}:undefined}});
 });
 try{
  const {retryPublishedImage}=await import('../workers/news/media');
  expect(await retryPublishedImage(env)).toEqual({pending:item.fingerprint});
  expect(await retryPublishedImage(env)).toMatchObject({preserved:true,documentId:'story-'+second});
 }finally{get.mockRestore();}
});
it('selects only reviewed source imagery and versions managed upgrades without overwriting chosen photos',async()=>{
 const {env,store,item}=await setup();const lease=await store.claim();await store.published(item.fingerprint,lease!.lease_token,'expected');
 const asset='image-'+'a'.repeat(40)+'-2000x1250-jpg';
 let doc:any={_id:'story-'+item.fingerprint,_type:'article',_rev:'rev1',publicationState:'published',automation:{candidateHash:'expected'},provenance:{sourceUrl:'https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay'},translations:{en:{title:'Ethereum update',slug:{current:'ethereum-update'}}},mainImage:{asset:{_ref:'old-generated'},credit:'Photo by Previous Photographer on Wikimedia Commons',license:'CC BY 2.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Old_photo.jpg',generatedBy:'token-on-air',generatedAssetId:'old-generated',generatedTitle:'Ethereum update',generatedVersion:'source-first-v6'}};
 let uploads=0;vi.stubGlobal('fetch',vi.fn(async(url,init)=>{
  if(String(url).includes('commons.wikimedia.org/w/api.php'))return ethereumPhoto();
  if(String(url).includes('/data/query/'))return Response.json({result:doc});
  if(String(url).includes('/assets/')){uploads++;expect(JSON.parse(init!.body as string).url).toBe('https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/ethereum.jpg/1280px-ethereum.jpg');return Response.json({document:{_id:asset}});}
  const patch=JSON.parse(init!.body as string).mutations[0].patch;doc={...doc,...patch.set};return Response.json({results:[{document:doc}]});
 }));
 try{
  const path='/v1/jobs/'+item.fingerprint+'/attach-image';expect((await worker.fetch(request(path,{},admin),env)).status).toBe(200);
  expect(doc.mainImage).toMatchObject({credit:'Photo by Ivan Radic on Wikimedia Commons',license:'CC BY 2.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Close-up_of_a_physical_Ethereum_coin_(51002904687).jpg',licenseUrl:'https://creativecommons.org/licenses/by/2.0',generatedVersion:'source-first-v8-topic-relevance'});
  expect((await worker.fetch(request(path,{},admin),env)).status).toBe(200);expect(uploads).toBe(1);
 }finally{vi.unstubAllGlobals();}
});
it('queues Worker-managed source photos for version refresh regardless of their photographer credit',async()=>{
 const {env}=await setup();
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({result:[]}));
 try{
  const {sanityApi}=await import('../workers/news/sanity');
  await sanityApi(env).imageCandidates();
  const query=new URL(String(get.mock.calls[0][0])).searchParams.get('query')||'';
  expect(query).toContain('mainImage.generatedAssetId == mainImage.asset._ref');
  expect(query).not.toContain('mainImage.credit == "Token on Air"');
 }finally{get.mockRestore();}
});
it('claims the newest source story even when an older feed batch arrived later',async()=>{
 const {store,item}=await setup();await store.enqueue('openai',{...item,fingerprint:'e'.repeat(64),url:'https://openai.com/index/older',publishedAt:new Date(Date.parse(item.publishedAt)-3600000).toISOString()},Date.now()+1000);
 expect((await store.claim())?.id).toBe(item.fingerprint);
});
it('enriches repeated feed metadata with images without changing facts, dates or job state',async()=>{
 const {store,item}=await setup();await store.claim();const prior=await store.get(item.fingerprint);
 await store.enqueueMany('openai',[{...item,title:'Changed title',publishedAt:new Date().toISOString(),imageUrl:'https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e'}]);
 const after=await store.get(item.fingerprint);expect(after?.state).toBe(prior?.state);expect(after?.lease_token).toBe(prior?.lease_token);expect(JSON.parse(after!.payload)).toMatchObject({...item,imageUrl:'https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e'});
});
