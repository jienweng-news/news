import {it,expect} from 'vitest';
import {testDB} from './fixtures/d1';
import {D1Store} from '../workers/news/store';
const item={title:'News',url:'https://example.com/news',publishedAt:'2026-10-23T10:00:00.000Z',fingerprint:'a'.repeat(64)};
it('deduplicates durable metadata and fences expired work owners',async()=>{
 const {db}=testDB();const a=new D1Store(db),b=new D1Store(db);
 await a.enqueue('source',item,1000);await b.enqueue('source',item,2000);
 const first=await a.claim(3000);expect(first?.created_at).toBe(1000);expect(await b.claim(4000)).toBeNull();
 const second=await b.claim(400000);expect(second?.lease_token).not.toBe(first?.lease_token);
 expect(await a.hold(item.fingerprint,first!.lease_token,'late')).toBe(false);
 expect(await b.hold(item.fingerprint,second!.lease_token,'review')).toBe(true);
 expect(await a.claim(800000)).toBeNull();expect((await a.status()).jobs).toEqual([{state:'held',count:1}]);
});
it('holds exhausted leases and gives the publisher lock a fenced owner',async()=>{
 const {db}=testDB();const store=new D1Store(db);await store.enqueue('source',item,1000);
 for(let i=0;i<5;i++)expect(await store.claim(1000+i*400000)).not.toBeNull();
 expect(await store.claim(3000000)).toBeNull();
 expect(await store.lock('owner1',1000)).toBe(true);expect(await store.lock('owner2',2000)).toBe(false);
 await store.unlock('wrong');expect(await store.lock('owner2',3000)).toBe(false);
 expect(await store.lock('owner2',200000)).toBe(true);await store.unlock('owner1');expect(await store.lock('owner3',200001)).toBe(false);
});
it('does not allow a stale owner to mark publication or release terminal jobs',async()=>{
 const {db}=testDB();const store=new D1Store(db);await store.enqueue('source',item,1000);const job=await store.claim(1000);
 expect(await store.published(job!.id,'wrong','hash')).toBe(false);
 expect(await store.published(job!.id,job!.lease_token,'hash')).toBe(true);
 expect(await store.release(job!.id)).toBe(false);expect((await store.get(job!.id))?.document_id).toBe('story.'+job!.id);
});
