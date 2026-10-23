import type {D1Database} from '@cloudflare/workers-types';
import type {FeedItem} from '../../automation/feed';
export interface Job {id:string;source:string;state:string;payload:string;created_at:number;attempts:number;lease_until:number;lease_token:string;document_id:string|null;candidate_hash:string|null}
export interface SourceRow {id:string;url:string;resolved_url:string|null;automation_enabled:number;rights_status:string;allowed_reuse:string;proposed_poll_minutes:number;next_poll:number;etag:string|null;last_modified:string|null;last_success:number|null;lease_token:string}
export class D1Store {
 constructor(readonly db:D1Database){}
 async enqueue(source:string,item:FeedItem,now=Date.now()){
  await this.db.prepare('INSERT OR IGNORE INTO jobs(id,source,payload,created_at) VALUES(?,?,?,?)').bind(item.fingerprint,source,JSON.stringify(item),now).run();
 }
 async enqueueMany(source:string,items:FeedItem[],now=Date.now()){
  if(!items.length)return;
  // One atomic insert, not one D1 subrequest per feed item.
  await this.db.prepare(`INSERT OR IGNORE INTO jobs(id,source,payload,created_at)
   SELECT json_extract(value,'$.fingerprint'),?,json(value),? FROM json_each(?)`).bind(source,now,JSON.stringify(items)).run();
 }
 async reserveSlugs(job:string,slugs:Array<[string,string]>){
  // A NOT NULL conflict aborts the entire transactional batch if any slug belongs to another job.
  await this.db.batch(slugs.map(([locale,slug])=>this.db.prepare(`INSERT INTO slug_reservations(locale,slug,job) VALUES(?,?,?)
   ON CONFLICT(locale,slug) DO UPDATE SET job=CASE WHEN slug_reservations.job=excluded.job THEN excluded.job ELSE NULL END`).bind(locale,slug,job)));
 }
 get(id:string){return this.db.prepare('SELECT * FROM jobs WHERE id=?').bind(id).first<Job>();}
 async claim(now=Date.now()){
  await this.db.prepare("UPDATE jobs SET state='held',lease_until=0,last_error='Retry limit' WHERE state='processing' AND lease_until<=? AND attempts>=5").bind(now).run();
  return this.db.prepare(`UPDATE jobs SET state='processing',lease_until=?,lease_token=?,attempts=attempts+1
   WHERE id=(SELECT id FROM jobs WHERE (state='queued' OR (state='processing' AND lease_until<=?)) AND attempts<5 AND (SELECT until FROM publisher_lock WHERE id=1)<=? ORDER BY json_extract(payload,'$.publishedAt') DESC,created_at DESC,id LIMIT 1) RETURNING *`)
   .bind(now+300000,crypto.randomUUID(),now,now).first<Job>();
 }
 async owned(id:string,token:string,now=Date.now()){
  return this.db.prepare("SELECT * FROM jobs WHERE id=? AND state='processing' AND lease_token=? AND lease_until>?").bind(id,token,now).first<Job>();
 }
 async hold(id:string,token:string,reason:string){
  const r=await this.db.prepare("UPDATE jobs SET state='held',lease_until=0,last_error=? WHERE id=? AND state='processing' AND lease_token=?").bind(reason.slice(0,100),id,token).run();return r.meta.changes===1;
 }
 async published(id:string,token:string,hash:string){
  const r=await this.db.prepare("UPDATE jobs SET state='published',document_id=?,candidate_hash=?,lease_until=0,last_error=NULL WHERE id=? AND state='processing' AND lease_token=?").bind('story-'+id,hash,id,token).run();return r.meta.changes===1;
 }
 async release(id:string){
  const r=await this.db.prepare("UPDATE jobs SET state='queued',lease_until=0,lease_token='',attempts=0,last_error=NULL WHERE id=? AND state='held'").bind(id).run();return r.meta.changes===1;
 }
 async lock(owner:string,now=Date.now()){
  const r=await this.db.prepare('UPDATE publisher_lock SET owner=?,until=? WHERE id=1 AND until<=?').bind(owner,now+120000,now).run();return r.meta.changes===1;
 }
 async unlock(owner:string){await this.db.prepare("UPDATE publisher_lock SET owner='',until=0 WHERE id=1 AND owner=?").bind(owner).run();}
 async audit(job:string,event:string){await this.db.prepare('INSERT INTO audit(job,event,time) VALUES(?,?,?)').bind(job,event,Date.now()).run();}
 async status(){return {jobs:(await this.db.prepare('SELECT state,count(*) AS count FROM jobs GROUP BY state').all()).results,sources:(await this.db.prepare('SELECT id,automation_enabled,last_success,last_error,next_poll FROM sources ORDER BY id').all()).results};}
 source(id:string){return this.db.prepare('SELECT * FROM sources WHERE id=?').bind(id).first<SourceRow>();}
 async dueSource(now=Date.now()){
  return this.db.prepare(`UPDATE sources SET next_poll=?,lease_token=? WHERE id=(SELECT id FROM sources
   WHERE automation_enabled=1 AND rights_status='reviewed' AND allowed_reuse='metadata-discovery' AND next_poll<=?
   ORDER BY next_poll,id LIMIT 1) RETURNING *`).bind(now+900000,crypto.randomUUID(),now).first<SourceRow>();
 }
 async prune(now=Date.now()){
  await this.db.batch([
   this.db.prepare('DELETE FROM audit WHERE time<?').bind(now-180*86400000),
   this.db.prepare("DELETE FROM jobs WHERE state IN ('queued','held') AND created_at<?").bind(now-30*86400000),
   this.db.prepare("UPDATE jobs SET payload='{}' WHERE state IN ('published','withdrawn') AND payload!='{}' AND created_at<?").bind(now-30*86400000)
  ]);
 }
}
