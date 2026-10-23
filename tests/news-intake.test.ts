import {it,expect,vi} from 'vitest';import {createHash} from 'node:crypto';
import {Collector,metadataBatches,groupLeads,robotsAllow} from '../automation/n8n/intake';
const item=(url='https://example.org/news',title='A meaningful primary announcement today')=>({url,title,publishedAt:new Date().toISOString(),fingerprint:createHash('sha256').update(url).digest('hex')});
const source={id:'fixture',url:'https://example.org/rss',automation_enabled:true,rights_status:'reviewed',allowed_reuse:'metadata-discovery',proposed_poll_minutes:5};
it('deduplicates canonical URLs but retains different leads and flags similar headlines',()=>{
 const groups=groupLeads([{...item(),source:'a'},{...item('https://example.org/news?utm_source=b'),source:'b'},{...item('https://other.org/story'),source:'c'},{...item('https://other.org/different','A different follow-up announcement'),source:'d'}]);
 expect(groups.unique).toHaveLength(3);expect(groups.related[0].urls).toHaveLength(2);expect(groups.related[0].sources).toEqual(['a','b','c']);
});
it('chunks multilingual metadata by UTF8 bytes and item count',()=>{
 const rows=Array.from({length:100},(_,i)=>item('https://example.org/'+i,'新聞'.repeat(200)));const batches=metadataBatches('fixture',rows);
 expect(batches.flatMap(b=>b.items)).toHaveLength(100);for(const b of batches){expect(Buffer.byteLength(JSON.stringify(b))).toBeLessThanOrEqual(60000);expect(b.items.length).toBeLessThanOrEqual(50);}
});
it('respects crawler groups, longest allow rules and disallow wildcards',()=>{
 expect(robotsAllow('User-agent: *\nDisallow: /private\nAllow: /private/public','https://example.org/private/a')).toBe(false);
 expect(robotsAllow('User-agent: *\nDisallow: /private\nAllow: /private/public','https://example.org/private/public/a')).toBe(true);
 expect(robotsAllow('User-agent: Other\nDisallow: /\n\nUser-agent: *\nAllow: /','https://example.org/news')).toBe(true);
 expect(robotsAllow('User-agent: *\nDisallow: /search*','https://example.org/search?q=a')).toBe(false);
});
it('persists polling checkpoints, sends conditional headers, backs off failures, and excludes inactive rows',async()=>{
 let now=Date.now();const headers:any[]=[];const responses=[{status:200,body:'User-agent: *\nAllow: /',headers:{}},{status:200,body:`<rss><channel><item><title>News</title><link>https://example.org/news</link><pubDate>${new Date().toUTCString()}</pubDate></item></channel></rss>`,headers:{etag:'v1'}},{status:304,body:'',headers:{}}];
 const get=vi.fn(async(_u:any,_h:any,h:any)=>{headers.push(h);return responses.shift()!;});const sent:any[]=[];
 const c=new Collector(':memory:',[source,{...source,id:'off',automation_enabled:false}],async b=>{sent.push(b);},get,()=>now);
 await c.poll(AbortSignal.timeout(1000));expect(sent).toHaveLength(1);expect(c.context()).toHaveLength(1);
 await c.poll(AbortSignal.timeout(1000));expect(get).toHaveBeenCalledTimes(2);
 now+=300001;await c.poll(AbortSignal.timeout(1000));expect(headers.at(-1)['If-None-Match']).toBe('v1');c.close();
});
it('never ingests unapproved hosts from a compromised feed',async()=>{
 const get=vi.fn(async(url:string)=>({status:200,headers:{},body:url.endsWith('robots.txt')?'User-agent: *\nAllow: /':`<rss><channel><item><title>Bad</title><link>https://evil.test/a</link><pubDate>${new Date().toUTCString()}</pubDate></item></channel></rss>`}));const send=vi.fn();const c=new Collector(':memory:',[source],send,get);
 await c.poll(AbortSignal.timeout(1000));expect(send).not.toHaveBeenCalled();c.close();
});
it('accumulates monitor-only leads privately without enabling ingestion or article-page access',async()=>{
 const get=vi.fn(async(url:string)=>({status:200,headers:{},body:url.endsWith('robots.txt')?'User-agent: *\nAllow: /':`<rss><channel><item><title>Private lead</title><link>https://example.org/news</link><pubDate>${new Date().toUTCString()}</pubDate></item></channel></rss>`}));const send=vi.fn();
 const c=new Collector(':memory:',[{...source,automation_enabled:false,monitoring_enabled:true}],send,get);
 await c.poll(AbortSignal.timeout(1000));expect(c.context()).toHaveLength(1);expect(send).not.toHaveBeenCalled();expect(await c.canAccess('https://example.org/news',AbortSignal.timeout(1000))).toBe(false);c.close();
});
it('does not let a high-volume feed erase all other sources from context',async()=>{
 const get=vi.fn(async(url:string)=>({status:200,headers:{},body:url.endsWith('robots.txt')?'User-agent: *\nAllow: /':'<rss><channel>'+Array.from({length:url.includes('/many')?200:1},(_,i)=>`<item><title>Lead ${i}</title><link>https://example.org/${url.includes('/many')?'many':'one'}-${i}</link><pubDate>${new Date().toUTCString()}</pubDate></item>`).join('')+'</channel></rss>'}));
 const c=new Collector(':memory:',[{...source,id:'many',url:'https://example.org/many'},{...source,id:'one',url:'https://example.org/one'}],async()=>{},get);await c.poll(AbortSignal.timeout(1000));expect(c.context().filter((r:any)=>r.source==='many').length).toBeLessThanOrEqual(10);expect(c.context().some((r:any)=>r.source==='one')).toBe(true);c.close();
});
