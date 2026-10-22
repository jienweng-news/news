import {DatabaseSync} from 'node:sqlite';
import type {FeedItem} from './feed';
export interface Job{id:string;source:string;state:string;payload:string;attempts:number;lease_until:number;next_at:number;document_id:string|null;candidate_hash:string|null;last_error:string|null}
export class JobQueue{
 readonly db:DatabaseSync;
 constructor(path:string){this.db=new DatabaseSync(path);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,source TEXT NOT NULL,state TEXT NOT NULL,payload TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,lease_until INTEGER NOT NULL DEFAULT 0,next_at INTEGER NOT NULL DEFAULT 0,document_id TEXT,candidate_hash TEXT,last_error TEXT,created_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS sources(id TEXT PRIMARY KEY,etag TEXT,last_modified TEXT,last_success INTEGER,last_error TEXT,next_poll INTEGER NOT NULL DEFAULT 0);CREATE TABLE IF NOT EXISTS publisher_lock(id INTEGER PRIMARY KEY,until INTEGER NOT NULL); INSERT OR IGNORE INTO publisher_lock(id,until) VALUES(1,0);CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,job TEXT,event TEXT,time INTEGER,detail TEXT);`);}
 enqueue(source:string,item:FeedItem,now=Date.now()):string{this.db.prepare('INSERT OR IGNORE INTO jobs(id,source,state,payload,created_at) VALUES(?,?,?,?,?)').run(item.fingerprint,source,'queued',JSON.stringify(item),now);return item.fingerprint;}
 claim(now=Date.now()):Job|null{
  this.db.exec('BEGIN IMMEDIATE');try{const row=this.db.prepare("SELECT * FROM jobs WHERE ((state='queued' AND next_at<=?) OR (state='processing' AND lease_until<?)) AND attempts<5 ORDER BY created_at DESC LIMIT 1").get(now,now) as unknown as Job|undefined;
   if(!row){this.db.exec('COMMIT');return null;}this.db.prepare("UPDATE jobs SET state='processing',lease_until=?,attempts=attempts+1 WHERE id=?").run(now+300000,row.id);this.db.exec('COMMIT');return this.get(row.id);
  }catch(error){this.db.exec('ROLLBACK');throw error;}
 }
 get(id:string):Job|null{return this.db.prepare('SELECT * FROM jobs WHERE id=?').get(id) as unknown as Job||null;}
 list():Job[]{return this.db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all() as unknown as Job[];}
 hold(id:string,reason:string){this.db.prepare("UPDATE jobs SET state='held',lease_until=0,last_error=? WHERE id=? AND state!='published'").run(reason.slice(0,200),id);this.audit(id,'held',reason.slice(0,200));}
 retry(id:string,now=Date.now()){const job=this.get(id);if(!job||job.state!=='processing')throw new Error('Job is not processing');if(job.attempts>=5)return this.hold(id,'Retry limit');this.db.prepare("UPDATE jobs SET state='queued',lease_until=0,next_at=? WHERE id=?").run(now+Math.min(3600000,30000*2**job.attempts),id);}
 published(id:string,documentId:string,hash:string){this.db.prepare("UPDATE jobs SET state='published',document_id=?,candidate_hash=?,lease_until=0,last_error=NULL WHERE id=?").run(documentId,hash,id);this.audit(id,'published',documentId);}
 audit(id:string,event:string,detail:string){this.db.prepare('INSERT INTO audit(job,event,time,detail) VALUES(?,?,?,?)').run(id,event,Date.now(),detail);}
 lockPublisher(now=Date.now()):boolean{return this.db.prepare('UPDATE publisher_lock SET until=? WHERE id=1 AND until<?').run(now+120000,now).changes===1;}
 unlockPublisher(){this.db.prepare('UPDATE publisher_lock SET until=0 WHERE id=1').run();}
 close(){this.db.close();}
}
