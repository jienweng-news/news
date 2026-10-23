// Actual workerd + persistent D1; no external requests, CMS writes or email.
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {createHash,createHmac} from 'node:crypto';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
const dir=mkdtempSync(join(tmpdir(),'toa-d1-'));
const token='local-writer-'.padEnd(40,'w'),admin='local-admin-'.padEnd(40,'a'),secret='local-verifier-'.padEnd(40,'s');
const id='b'.repeat(64),url='https://openai.com/index/local-smoke',sourceDate=new Date(Date.now()-3600000).toISOString();
let saved,mutations=0,requests=0,feedRequests=0;
const bindings={ADMIN_TOKEN:admin,WRITER_TOKEN:token,VALIDATION_SECRET:secret,SANITY_WRITE_TOKEN:'local-test-only',SANITY_PROJECT_ID:'4k0o7q9m',SANITY_DATASET:'production',SANITY_EDITOR_ID:'editor-jienweng',AUTOMATION_ENABLED:'0',AUTOMATION_KILL_SWITCH:'1'};
const options={modules:true,scriptPath:resolve('.private/cloudflare/bundle/index.js'),compatibilityDate:'2026-10-01',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'local-news'},d1Persist:dir,bindings,
 outboundService:async request=>{
  requests++;const target=new URL(request.url);
  if(target.hostname==='openai.com'){feedRequests++;return new Response('<rss><channel>'+Array.from({length:50},(_,i)=>`<item><title>Runtime feed ${i}</title><link>https://openai.com/index/runtime-${i}</link><pubDate>${new Date().toUTCString()}</pubDate></item>`).join('')+'</channel></rss>');}
  assert.equal(target.hostname,'4k0o7q9m.api.sanity.io','No unexpected external request');
  if(target.pathname.includes('/query/'))return Response.json({result:target.searchParams.get('query').startsWith('count(')?0:saved||null});
  const body=await request.json();mutations++;const mutation=body.mutations[0];
  if(mutation.createIfNotExists)saved=saved||{...mutation.createIfNotExists,_rev:'r'+mutations};
  else {assert.equal(mutation.patch.ifRevisionID,saved._rev);saved={...saved,...mutation.patch.set,_rev:'r'+mutations};}
  return Response.json({results:[{id:saved._id,document:saved}]});
 }};
const runtime=options=>new Miniflare({...convertV4MiniflareOptions(options),resourcePersistencePath:dir});
let mf=runtime(options);
const post=(path,body={},key=token)=>mf.dispatchFetch('https://worker.test'+path,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body)});
const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}':JSON.stringify(value);
function signed(article){const evidence=[{url,quote:'Local test evidence',contentHash:'a'.repeat(64)}];const hash=createHash('sha256').update(canonical({article,evidence})).digest('hex');const checks=Object.fromEntries(['sourceRights','primaryEvidence','claimsVerified','translationConsistency','originalWording','duplicateCheck','relationshipVerified'].map(k=>[k,true]));const payload={hash,checks,verifiedAt:new Date().toISOString()};return {article,evidence,report:{...payload,signature:createHmac('sha256',secret).update(canonical(payload)).digest('hex')}};}
try{
 let db=await mf.getD1Database('DB');
 for(const file of readdirSync('workers/news/migrations').sort()){
  const sql=readFileSync('workers/news/migrations/'+file,'utf8');for(const statement of sql.split(';').filter(s=>s.trim()))await db.prepare(statement).run();
 }
 assert.equal((await db.prepare('SELECT count(*) AS n FROM sources WHERE automation_enabled=1').first()).n,0);
 assert.equal((await mf.dispatchFetch('https://worker.test/health')).status,200);
 assert.equal((await post('/v1/jobs/claim',{},'invalid')).status,401);
 assert.equal((await post('/v1/jobs/claim')).status,503);
 const paused=await mf.getWorker();await paused.scheduled({cron:'* * * * *'});assert.equal(requests,0);
 await db.prepare("UPDATE sources SET automation_enabled=1,rights_status='reviewed',allowed_reuse='metadata-discovery' WHERE id='openai'").run();
 await db.prepare('INSERT INTO jobs(id,source,payload,created_at) VALUES(?,?,?,?)').bind(id,'openai',JSON.stringify({title:'Local runtime smoke',url,publishedAt:sourceDate,fingerprint:id}),Date.now()).run();
 // Recreate the runtime using the same volume, proving queue survival.
 await mf.dispose();mf=runtime({...options,bindings:{...bindings,AUTOMATION_ENABLED:'1',AUTOMATION_KILL_SWITCH:'0'}});db=await mf.getD1Database('DB');
 assert.equal((await post('/v1/jobs/claim',{},'invalid')).status,401);
 assert.equal((await db.prepare('SELECT count(*) AS n FROM jobs').first()).n,1,'Persistent job before claim');
 console.log('D1 schema exists after restart');
 const claims=await Promise.all([post('/v1/jobs/claim'),post('/v1/jobs/claim')]);const values=await Promise.all(claims.map(r=>r.json()));
 const claim=values.find(v=>v.jobId);assert.ok(claim,JSON.stringify(values));assert.equal(values.filter(v=>v.jobId).length,1,'Atomic concurrent claim');assert.equal(claim.item.publishedAt,sourceDate);
 const now=new Date().toISOString();const body=[{_type:'block',_key:'b',style:'normal',children:[{_type:'span',_key:'s',text:'Local runtime fixture; no reporting.',marks:[]}],markDefs:[]}];
 const article={section:'ai',format:'news',relationship:'none',author:{name:'jienweng',slug:'jienweng'},publishedAt:now,updatedAt:now,language:'en',sources:[url],corrections:[],translations:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{title:'Local smoke',slug:'local-smoke',summary:'Test only.',body}]))};
 let candidate=signed(article);let r=await post('/v1/jobs/'+id+'/publish',{leaseToken:claim.leaseToken,candidate});assert.equal(r.status,200,await r.text());
 assert.equal(saved._id,'story.'+id);assert.equal(saved.provenance.sourcePublishedAt,sourceDate);assert.equal(saved.provenance.importedAt,saved.publishedAt);assert.ok(Date.parse(saved.publishedAt)>Date.parse(sourceDate));
 r=await post('/v1/jobs/'+id+'/publish',{leaseToken:claim.leaseToken,candidate});assert.equal(r.status,200);assert.equal(mutations,1,'Idempotent CMS write');
 const first=saved.publishedAt;article.publishedAt=first;article.updatedAt=new Date(Date.parse(first)+1).toISOString();article.corrections=[{date:article.updatedAt,notes:{en:'Correction',zh:'更正',zhCn:'更正'}}];candidate=signed(article);
 r=await post('/v1/jobs/'+id+'/correct',{candidate},admin);assert.equal(r.status,200,await r.text());assert.equal(saved.publishedAt,first);assert.equal(saved.provenance.sourcePublishedAt,sourceDate);
 r=await post('/v1/jobs/'+id+'/withdraw',{},admin);assert.equal(r.status,200);assert.equal(saved.publicationState,'withdrawn');
 const enabledWorker=await mf.getWorker();await enabledWorker.scheduled({cron:'* * * * *'});
 assert.equal(feedRequests,1);assert.equal((await db.prepare("SELECT count(*) AS n FROM jobs WHERE state='queued'").first()).n,50,'Atomic bounded50-item RSS import');
 await db.prepare("UPDATE sources SET next_poll=0 WHERE id='openai'").run();await enabledWorker.scheduled({cron:'* * * * *'});assert.equal((await db.prepare('SELECT count(*) AS n FROM jobs').first()).n,51,'Feed replay deduplication');
 assert.equal((await post('/v1/jobs/'+id+'/publish',{candidate})).status,409);
 const hostItem={title:'Original host-collected metadata',url:'https://openai.com/index/runtime-ingest',publishedAt:new Date().toISOString()};hostItem.fingerprint=createHash('sha256').update(hostItem.url).digest('hex');
 assert.equal((await post('/v1/ingest',{source:'openai',items:[{...hostItem,fingerprint:'wrong'}]})).status,422);
 assert.equal((await post('/v1/ingest',{source:'openai',items:[hostItem]})).status,200);
 assert.equal((await post('/v1/ingest',{source:'openai',items:[hostItem]})).status,200);
 assert.equal((await db.prepare('SELECT count(*) AS n FROM jobs').first()).n,52,'Host metadata replay deduplicated');
 const quarantine=await(await post('/v1/jobs/claim')).json();assert.ok(quarantine.jobId);
 assert.equal((await post('/v1/jobs/'+quarantine.jobId+'/hold',{leaseToken:'wrong'})).status,409);
 await db.prepare('UPDATE jobs SET lease_until=0 WHERE id=?').bind(quarantine.jobId).run();
 assert.equal((await post('/v1/jobs/'+quarantine.jobId+'/hold',{leaseToken:quarantine.leaseToken})).status,200);
 await mf.dispose();mf=runtime({...options,bindings:{...bindings,AUTOMATION_ENABLED:'1',AUTOMATION_KILL_SWITCH:'0'}});db=await mf.getD1Database('DB');
 assert.equal((await db.prepare('SELECT state FROM jobs WHERE id=?').bind(quarantine.jobId).first()).state,'held','Quarantine survives runtime restart');
 assert.equal((await post('/v1/jobs/'+quarantine.jobId+'/hold',{leaseToken:quarantine.leaseToken})).status,200);
 assert.notEqual((await(await post('/v1/jobs/claim')).json()).jobId,quarantine.jobId,'Held rejection never automatically reclaims');
 const status=await mf.dispatchFetch('https://worker.test/v1/status',{headers:{Authorization:'Bearer '+admin}});assert.equal(status.status,200);assert.ok(!(await status.text()).includes(secret));
 console.log('Cloudflare runtime smoke passed: real workerd+D1 migrations, paused cron, auth, restart persistence, concurrent claims, 50-item scheduled RSS/deduplication, signed publish/replay, dates, correction, withdrawal and owner-fenced durable quarantine and authenticated host metadata ingestion. All Sanity traffic intercepted; no external content written.');
}finally{await mf.dispose();rmSync(dir,{recursive:true,force:true});}
