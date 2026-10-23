import {it,expect,vi} from 'vitest';
import worker,{runScheduled} from '../workers/news/index';
import {D1Store} from '../workers/news/store';
import {testDB} from './fixtures/d1';
import {fetchFeed} from '../workers/news/network';
import {candidateHash,requiredChecks,signReport} from '../automation/publisher';
import {rawArticle} from './fixtures/articles';
const token='w'.repeat(40),admin='a'.repeat(40),secret='s'.repeat(40);
const envFor=(db:any)=>({DB:db,WRITER_TOKEN:token,ADMIN_TOKEN:admin,VALIDATION_SECRET:secret,AUTOMATION_ENABLED:'1',AUTOMATION_KILL_SWITCH:'0',SANITY_PROJECT_ID:'4k0o7q9m',SANITY_DATASET:'production',SANITY_EDITOR_ID:'editor-jienweng',SANITY_WRITE_TOKEN:'private-token'});
const request=(path:string,body:unknown={},key=token)=>new Request('https://worker.test'+path,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body)});
export function signedCandidate(url:string){const now=new Date().toISOString(),raw=rawArticle({sources:[url],publishedAt:now,updatedAt:now});const article={...raw,translations:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{title:'Story',summary:'Story',slug:'stable-story',body:raw.body}]))};const evidence=[{url,quote:'Evidence',contentHash:'a'.repeat(64)}];return {article,evidence,report:signReport(candidateHash({article,evidence}),Object.fromEntries(requiredChecks.map(c=>[c,true])),now,secret)};}
async function setup(){const {db,sqlite}=testDB();sqlite.exec("INSERT INTO sources(id,url,automation_enabled,rights_status,allowed_reuse) VALUES('openai','https://openai.com/news/rss.xml',1,'reviewed','metadata-discovery')");const store=new D1Store(db);const item={title:'Original event',url:'https://openai.com/index/example',publishedAt:new Date(Date.now()-3600000).toISOString(),fingerprint:'b'.repeat(64)};await store.enqueue('openai',item);return {db,sqlite,store,item,env:envFor(db)};}
it('authenticates before touching data and keeps paused schedules inert',async()=>{
 const env=envFor({prepare:()=>{throw Error('DB must not be touched');}});env.AUTOMATION_ENABLED='0';
 expect((await worker.fetch(new Request('https://worker.test/health'),env)).status).toBe(200);
 expect((await worker.fetch(request('/v1/jobs/claim',{},'wrong'),env)).status).toBe(401);
 expect((await worker.fetch(request('/v1/jobs/claim'),env)).status).toBe(503);
 expect(await runScheduled(env,vi.fn())).toEqual({paused:true});
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
it('keeps Sanity identity and import dates fixed and recovers an uncertain write',async()=>{
 const {env,store,item}=await setup();const claim=await(await worker.fetch(request('/v1/jobs/claim'),env)).json() as any;
 const input={leaseToken:claim.leaseToken,candidate:signedCandidate(item.url)};let saved:any;let calls=0;
 const get=vi.spyOn(globalThis,'fetch').mockImplementation(async(url,init)=>{
  calls++;if(String(url).includes('/data/query/'))return Response.json({result:String(url).includes('count(')||String(url).includes('count%28')?0:saved||null});
  const body=JSON.parse(init!.body as string);saved=body.mutations[0].createIfNotExists;throw Error('Connection lost after commit');
 });
 try{
  expect((await worker.fetch(request('/v1/jobs/'+item.fingerprint+'/publish',input),env)).status).toBe(502);
  expect(saved._id).toBe('story.'+item.fingerprint);expect(saved.provenance.sourcePublishedAt).toBe(item.publishedAt);expect(Date.parse(saved.publishedAt)).toBeGreaterThan(Date.parse(item.publishedAt));
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
 let saved:any={_id:'story.'+item.fingerprint,_rev:'rev1',publicationState:'published',publishedAt:candidate.article.publishedAt,updatedAt:candidate.article.updatedAt,translations:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{slug:{current:'stable-story'}}])),corrections:[],automation:{candidateHash:validatedHash},provenance:{sourcePublishedAt:item.publishedAt}};
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
  if(String(url).includes('/data/query/'))return Response.json({result:String(url).includes('count(')||String(url).includes('count%28')?0:null});
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
