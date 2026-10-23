import {it,expect,vi,afterEach} from 'vitest';import {createHash} from 'node:crypto';
vi.mock('../automation/network',()=>({safeFetch:vi.fn(async(url:string)=>({status:200,headers:{},body:url.endsWith('/older')?'<article>Old schedule: 2026-10-26.</article>':'<article>The company postponed the upgrade. No new date is set.<a href="https://example.org/older">Earlier schedule</a></article>'}))}));
import {pipeline} from '../automation/n8n/pipeline';
import {requiredChecks} from '../automation/publisher';import {agentTask} from '../automation/n8n/agent';
const url='https://example.org/news';const item={title:'Upgrade postponed',url,publishedAt:new Date().toISOString(),fingerprint:createHash('sha256').update(url).digest('hex')};
function setup(){const calls:any[]=[];const draft={section:'crypto',editions:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{title:'Upgrade postponed',summary:'A new date is not set.',slug:'upgrade-postponed-'+l.toLowerCase(),paragraphs:['The company postponed the upgrade.','A new date is not set.']}])),evidence:[{url,quote:'The company postponed the upgrade.'}]};
 vi.stubGlobal('fetch',vi.fn(async(input:any,init:any)=>{const u=String(input);const body=init?.body?JSON.parse(init.body):null;calls.push({url:u,body});if(!u.endsWith('/v1/task')&&!u.includes('.api.sanity.io'))throw Error('Dry-run made a remote queue/publish request');
 if(u.includes('.api.sanity.io'))return Response.json({result:[]});if(body.task==='research')return Response.json({primaryUrls:['https://example.org/older'],reason:'Superseded schedule'});if(body.task==='write')return Response.json(draft);return Response.json({...Object.fromEntries(requiredChecks.filter(k=>k!=='sourceRights').map(k=>[k,true])),reason:'Newer primary notice prevails'});}));
 const config={workerUrl:'https://worker.test',writerToken:'w'.repeat(48),agentUrl:'http://agent',agentToken:'a'.repeat(48),validationSecret:'s'.repeat(48),sources:[{id:'fixture',url:'https://example.org/feed',automation_enabled:true,rights_status:'reviewed',allowed_reuse:'metadata-discovery',proposed_poll_minutes:5,classification:'crypto-primary',review:{license:'CC-BY-4.0',attribution_name:'Example Foundation'}}],projectId:'fixture',dataset:'production',acceptanceItem:item,context:()=>[{...item,url:'https://example.org/older',title:'Earlier schedule'}],canAccess:async()=>true};return {calls,config};}
afterEach(()=>vi.unstubAllGlobals());
it('uses the production signed verifier path on real input without claiming, holding or publishing',async()=>{
 const {calls,config}=setup();const result=await pipeline(config)('queue');expect(result.state).toBe('validated');expect(result.published).toBe(false);expect(result.candidate.report.signature).toMatch(/^[a-f0-9]{64}$/);expect(calls.some(c=>c.url.includes('worker.test'))).toBe(false);
 const write=calls.find(c=>c.body?.task==='write').body.input;expect(write.snapshots).toHaveLength(2);expect(write.snapshots[1].text).toContain('Old schedule');
 const review=calls.find(c=>c.body?.task==='review').body.input;expect(review.candidate.article.translations.en.body.at(-1).children[0].text).toContain('CC BY 4.0');
});
it('does not fetch unapproved context and refuses robots-blocked primary article access',async()=>{
 const {config,calls}=setup();config.canAccess=async()=>false;const result=await pipeline(config)('queue');expect(result.state).toBe('held');expect(result.published).toBe(false);expect(calls).toHaveLength(0);
});
it('tells research and independent review to reconcile superseding notices and actual claims',()=>{
 expect(agentTask({task:'research'}).prompt).toContain('supersed');expect(agentTask({task:'review'}).prompt).toContain('unresolved');expect(agentTask({task:'review'}).prompt).toContain('material update');
});
it('does not treat locale or redirect aliases with identical text as independent evidence',async()=>{
 const {config,calls}=setup();config.context=()=>[{...item,url:'https://example.org/alias',title:'Same notice alias'}];const prior=globalThis.fetch;
 vi.stubGlobal('fetch',vi.fn(async(url:any,init:any)=>{const body=init?.body?JSON.parse(init.body):null;if(body?.task==='research')return Response.json({primaryUrls:['https://example.org/alias'],reason:'Duplicate alias'});return prior(url,init);}));
 const result=await pipeline(config)('queue');expect(result.state).toBe('validated');expect(calls.find(c=>c.body?.task==='write').body.input.snapshots).toHaveLength(1);
});
it('keeps fixed-stage failure diagnostics for private dry-run without exposing provider errors',async()=>{
 const {config}=setup();const previous=globalThis.fetch;
 vi.stubGlobal('fetch',vi.fn(async(url:any,init:any)=>{const body=init?.body?JSON.parse(init.body):null;if(body?.task==='write')return new Response('upstream secret-value',{status:502});return previous(url,init);}));
 const result=await pipeline(config)('queue');expect(result.state).toBe('held');expect(result.reason).toContain('write');expect(JSON.stringify(result)).not.toContain('secret-value');
});
it('extracts the main dated story rather than a related-post card',async()=>{
 const {plainText}=await import('../automation/n8n/pipeline');
 const html='<main><h1>Current forest research</h1><p>The current 2026 result.</p><section><h2>Related posts</h2><article>Old promotional card from 2025</article></section></main>';
 const text=plainText(html);expect(text).toContain('Current forest research');expect(text).toContain('current 2026 result');expect(text).not.toContain('Old promotional card');
});
it('retains source date before the heading and supplies independently configured relationship context',async()=>{
 const {plainText}=await import('../automation/n8n/pipeline');expect(plainText('<main><time>2026-10-22</time><h1>New announcement</h1><p>Current facts</p></main>')).toContain('2026-10-22');
 const {config,calls}=setup();await pipeline(config)('queue');const input=calls.find(c=>c.body?.task==='review').body.input;expect(input.discovery.publishedAt).toBe(item.publishedAt);expect(input.operatorPolicy.relationship).toBe('none');
});
