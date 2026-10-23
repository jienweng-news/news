import {expect,it} from 'vitest';
import {JobQueue} from '../automation/queue';
import {correctJob} from '../automation/lifecycle';
import {publishJob,candidateHash,requiredChecks,signReport} from '../automation/publisher';
import {rawArticle} from './fixtures/articles';
function correction(slug='stable'){
 const time=Date.now();const raw=rawArticle({publishedAt:new Date(time-7200000).toISOString(),updatedAt:new Date(time-1000).toISOString(),corrections:[{date:new Date(time-1000).toISOString(),notes:{en:'Correction',zh:'更正',zhCn:'更正'}}]});
 const article={...raw,translations:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{title:'Story',slug,summary:'Story',body:raw.body}]))};const evidence=[{url:raw.sources[0],quote:'Evidence',contentHash:'a'.repeat(64)}];const secret='v'.repeat(40);const hash=candidateHash({article,evidence});return{candidate:{article,evidence,report:signReport(hash,Object.fromEntries(requiredChecks.map(k=>[k,true])),new Date(time).toISOString(),secret)},secret};
}
it('preserves every published edition URL during corrections',async()=>{
 const {candidate,secret}=correction('collision');const q=new JobQueue(':memory:');const id=q.enqueue('source',{title:'Story',url:'https://example.com/a',publishedAt:candidate.article.publishedAt,fingerprint:'job'});q.published(id,'story-job','oldhash');let patched=false;
 const provenance={sourceUrl:'https://example.com/a',sourcePublishedAt:'2026-10-20T12:00:00.000Z',discoveredAt:'2026-10-21T12:00:00.000Z',importedAt:'2026-10-22T12:00:00.000Z'};const existing={provenance,_rev:'revision1',publishedAt:candidate.article.publishedAt,updatedAt:new Date(Date.now()-3600000).toISOString(),corrections:[],translations:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{slug:{current:'stable'}}]))};
 await expect(correctJob(q,id,candidate,{enabled:true,killSwitch:false,editorId:'editor',validationSecret:secret},async()=>existing,async()=>{patched=true;})).rejects.toThrow();expect(patched).toBe(false);
 const stable=structuredClone(candidate);for(const copy of Object.values(stable.article.translations))copy.slug='stable';stable.report=signReport(candidateHash({article:stable.article,evidence:stable.evidence}),Object.fromEntries(requiredChecks.map(k=>[k,true])),new Date().toISOString(),secret);
 await correctJob(q,id,stable,{enabled:true,killSwitch:false,editorId:'editor',validationSecret:secret},async()=>existing,async(doc,rev)=>{expect(doc.provenance).toEqual(provenance);expect(rev).toBe('revision1');expect(doc.publishedAt).toBe(candidate.article.publishedAt);patched=true;});expect(patched).toBe(true);q.close();
});
it('explicitly releases held jobs while protecting terminal records',()=>{
 const q=new JobQueue(':memory:');const id=q.enqueue('source',{title:'Story',url:'https://example.com/a',publishedAt:new Date().toISOString(),fingerprint:'job'});q.claim();q.hold(id,'Transient write failure');q.releaseHeld(id);expect(q.claim()?.id).toBe(id);q.published(id,'story-job','hash');expect(()=>q.releaseHeld(id)).toThrow();q.close();
});
it('holds an exhausted lease after a worker crash instead of stranding it',()=>{
 const q=new JobQueue(':memory:');const id=q.enqueue('source',{title:'Story',url:'https://example.com/a',publishedAt:new Date().toISOString(),fingerprint:'job'},1000);for(let i=0;i<5;i++)q.claim(1000+i*400000);expect(q.claim(1000+5*400000)).toBeNull();expect(q.get(id)?.state).toBe('held');q.close();
});

it('holds rejected writer output for explicit recovery',async()=>{const q=new JobQueue(':memory:');const id=q.enqueue('source',{title:'Story',url:'https://example.com/a',publishedAt:new Date().toISOString(),fingerprint:'job'});q.claim();await expect(publishJob(q,id,{}, {enabled:true,killSwitch:false,editorId:'editor',validationSecret:'v'.repeat(40)},async()=>{throw new Error('must not write');})).rejects.toThrow();expect(q.get(id)?.state).toBe('held');q.close();});
