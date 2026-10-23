import {expect,it} from 'vitest';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {parseFeed} from '../automation/feed';
import {isPublicIPv4,allowedUrl} from '../automation/network';
import {JobQueue} from '../automation/queue';
import {validateCandidate,publishJob} from '../automation/publisher';
import {rawArticle} from './fixtures/articles';
const now=Date.parse('2026-10-22T12:00:00Z');
const xml='<rss><channel><item><title>A story</title><link>https://example.com/a?utm_source=test</link><pubDate>Thu, 22 Oct 2026 10:00:00 GMT</pubDate></item><item><title>Old</title><link>https://example.com/old</link><pubDate>Sun, 18 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>';
it('parses bounded fresh metadata and rejects entity declarations',()=>{
 expect(parseFeed(xml,now)).toMatchObject([{title:'A story',url:'https://example.com/a'}]);
 expect(()=>parseFeed('<!DOCTYPE foo [<!ENTITY x SYSTEM "file:///etc/passwd">]><rss/>',now)).toThrow();
 expect(()=>parseFeed('<rss><',now)).toThrow();expect(()=>parseFeed('x'.repeat(2100000),now)).toThrow();
});
it('rejects private, loopback and unapproved destinations',()=>{
 for(const ip of ['127.0.0.1','10.1.2.3','169.254.169.254','172.16.0.1','192.168.0.1','100.64.0.1','::1'])expect(isPublicIPv4(ip)).toBe(false);
 expect(isPublicIPv4('8.8.8.8')).toBe(true);
 expect(()=>allowedUrl('https://evil.test/',new Set(['example.com']))).toThrow();expect(()=>allowedUrl('http://example.com/',new Set(['example.com']))).toThrow();
});
it('deduplicates across restart and recovers expired leases without reviving held jobs',()=>{
 const dir=mkdtempSync(join(tmpdir(),'toa-queue-'));const path=join(dir,'jobs.sqlite');
 try{let q=new JobQueue(path);const item=parseFeed(xml,now)[0];const id=q.enqueue('example',item,now);expect(q.enqueue('example',item,now)).toBe(id);expect(q.claim(now)?.id).toBe(id);q.close();q=new JobQueue(path);expect(q.claim(now+1000)).toBeNull();expect(q.claim(now+400000)?.id).toBe(id);q.hold(id,'evidence missing');expect(q.claim(now+800000)).toBeNull();expect(q.list().length).toBe(1);q.close();}finally{rmSync(dir,{recursive:true,force:true});}
});
it('holds unverified or partial candidates and never writes while publisher is disabled',async()=>{
 expect(()=>validateCandidate({article:rawArticle(),checks:{}})).toThrow();
 const q=new JobQueue(':memory:');const id=q.enqueue('example',parseFeed(xml,now)[0],now);q.claim(now);
 let wrote=false;await expect(publishJob(q,id,{} as any,{enabled:false,killSwitch:true},async()=>{wrote=true;})).rejects.toThrow();expect(wrote).toBe(false);q.close();
});
import {candidateHash,requiredChecks,signReport} from '../automation/publisher';
import {pollSources} from '../automation/poll';
it('publishes a verified job once with fixed identity and rejects tampered validation',async()=>{
 const q=new JobQueue(':memory:');const time=Date.now();const item=parseFeed(xml,now)[0];const id=q.enqueue('example',item,time);q.claim(time);
 const raw=rawArticle({sources:[item.url],publishedAt:new Date(time-3600000).toISOString(),updatedAt:new Date(time-3600000).toISOString()});
 const article={...raw,translations:Object.fromEntries(['en','zh','zhCn'].map(key=>[key,{title:'Story',slug:'story',summary:'Story',body:raw.body}]))};
 const evidence=[{url:item.url,quote:'Evidence excerpt',contentHash:'a'.repeat(64)}];const secret='v'.repeat(40);const hash=candidateHash({article,evidence});const checks=Object.fromEntries(requiredChecks.map(key=>[key,true]));const report=signReport(hash,checks,new Date(time).toISOString(),secret);const candidate={article,evidence,report};
 expect(validateCandidate(candidate,secret).hash).toBe(hash);
 expect(()=>validateCandidate({...candidate,article:{...article,summary:'tampered'}},secret)).toThrow();
 let writes=0;const write=async(doc:Record<string,any>)=>{writes++;expect(Date.parse(doc.publishedAt)).toBeGreaterThanOrEqual(time);expect(doc.updatedAt).toBe(doc.publishedAt);expect(doc.provenance).toEqual({sourceUrl:item.url,sourcePublishedAt:item.publishedAt,discoveredAt:new Date(time).toISOString(),importedAt:doc.publishedAt});expect(doc.author._ref).toBe('editor-jienweng');expect(doc._id).not.toContain(".");expect(doc._id).toBe(`story-${id}`);expect(doc).not.toHaveProperty('body');return {id:doc._id,hash:doc.automation.candidateHash};};
 const config={enabled:true,killSwitch:false,validationSecret:secret,editorId:'editor-jienweng'};
 expect(await publishJob(q,id,candidate,config,write)).toBe(`story-${id}`);await publishJob(q,id,candidate,config,write);expect(writes).toBe(1);q.close();
});
it('polls reviewed sources conditionally, skips disabled sources and isolates failures',async()=>{
 const q=new JobQueue(':memory:');const source={id:'example',url:'https://example.com/rss',automation_enabled:true,rights_status:'reviewed',allowed_reuse:'metadata-discovery',proposed_poll_minutes:5};let calls=0;
 const fetcher=async()=>{calls++;return {status:200,headers:{etag:'version1'},body:xml};};
 await pollSources(q,[{...source,id:'disabled',automation_enabled:false},source],now,fetcher);expect(q.list()).toHaveLength(1);await pollSources(q,[source],now+1000,fetcher);expect(calls).toBe(1);
 await pollSources(q,[source],now+1000000,async(_url,_hosts,headers)=>{expect(headers['If-None-Match']).toBe('version1');return {status:304,headers:{},body:''};});expect(q.list()).toHaveLength(1);
 const result=await pollSources(q,[{...source,id:'broken'}],now,async()=>{throw new Error('private detail');});expect(result).toEqual([{source:'broken',error:'Fetch/parse failed'}]);q.close();
});
it('accepts Atom alternate links and holds exhausted retries',()=>{
 const atom='<feed><entry><title>Atom</title><link rel="alternate" href="https://example.com/atom"/><published>2026-10-22T10:00:00Z</published></entry></feed>';expect(parseFeed(atom,now)[0].url).toBe('https://example.com/atom');
 const q=new JobQueue(':memory:');const id=q.enqueue('example',parseFeed(xml,now)[0],now);let time=now;for(let i=0;i<5;i++){q.claim(time);q.retry(id,time);time+=4000000;}expect(q.get(id)?.state).toBe('held');q.close();
});
import {withdrawJob} from '../automation/lifecycle';
it('withdraws only a known published job through the guarded publisher',async()=>{
 const q=new JobQueue(':memory:');const id=q.enqueue('example',parseFeed(xml,now)[0]);let removed=false;
 const cfg={enabled:true,killSwitch:false,editorId:'editor'};
 await expect(withdrawJob(q,id,cfg,async()=>{removed=true;})).rejects.toThrow();expect(removed).toBe(false);
 q.published(id,`story-${id}`,'testhash');await expect(withdrawJob(q,id,{...cfg,killSwitch:true},async()=>{removed=true;})).rejects.toThrow();expect(removed).toBe(false);
 await withdrawJob(q,id,cfg,async()=>{removed=true;});expect(removed).toBe(true);expect(q.get(id)?.state).toBe('withdrawn');q.close();
});
it('serializes independent publishers sharing a durable queue',()=>{const dir=mkdtempSync(join(tmpdir(),'toa-lock-'));try{const a=new JobQueue(join(dir,'jobs.sqlite')),b=new JobQueue(join(dir,'jobs.sqlite'));expect(a.lockPublisher(now)).toBe(true);expect(b.lockPublisher(now+1)).toBe(false);a.unlockPublisher();expect(b.lockPublisher(now+2)).toBe(true);a.close();b.close();}finally{rmSync(dir,{recursive:true,force:true});}});

it('does not confuse Atom updates with publication or accept ambiguous feed dates',()=>{
 const atom='<feed><entry><title>Updated only</title><link href="https://example.com/a"/><updated>2026-10-22T10:00:00Z</updated></entry></feed>';
 expect(parseFeed(atom,now)).toEqual([]);
 for(const date of ['2026-10-22T10:00:00','2026-10-22','Thu, 22 Oct 2026 10:00:00','2026-02-30T10:00:00Z']){
  expect(parseFeed(xml.replace('Thu, 22 Oct 2026 10:00:00 GMT',date),now)).toEqual([]);
 }
 expect(parseFeed(xml.replace('Thu, 22 Oct 2026 10:00:00 GMT','2026-10-22T18:00:00+08:00'),now)[0].publishedAt).toBe('2026-10-22T10:00:00.000Z');
});
it('accepts explicitly zoned feeds with high-precision fractions or omitted RSS seconds',()=>{
 for(const date of ['2026-10-22T10:00:00.123456Z','Thu, 22 Oct 2026 10:00 GMT']){
  expect(parseFeed(xml.replace('Thu, 22 Oct 2026 10:00:00 GMT',date),now)).toHaveLength(1);
 }
});
it('collects only PANews upload-host image metadata from the matching RSS item',()=>{
 const feed=xml.replace('https://example.com/a?utm_source=test','https://www.panewslab.com/en/articles/abc').replace('<pubDate>','<media:content url="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e"/><pubDate>');
 expect(parseFeed(feed,now)[0].imageUrl).toBe('https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e');
 expect(parseFeed(feed.replace('uploads.panewslab.com','evil.test'),now)[0].imageUrl).toBeUndefined();
});
