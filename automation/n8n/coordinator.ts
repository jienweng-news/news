import {DatabaseSync} from 'node:sqlite';
import {randomUUID,createHash} from 'node:crypto';
import {candidateHash,requiredChecks,signReport,validateCandidate} from '../publisher';
import {Refused} from '../../workers/news/config';
export interface Snapshot{url:string;text:string;hash:string;primary:boolean}
export function buildCandidate(draft:any,discoveryUrl:string){
 const now=new Date().toISOString();
 if(!draft||!['ai','crypto'].includes(draft.section)||!Array.isArray(draft.evidence)||!draft.evidence.some((e:any)=>e.url===discoveryUrl))throw Error('Discovery attribution required');
 return {article:{section:draft.section,format:'news',relationship:'none',publishedAt:now,updatedAt:now,author:{name:'jienweng',slug:'jienweng'},sources:[...new Set(draft.evidence.map((e:any)=>e.url))],corrections:[],translations:Object.fromEntries(['en','zh','zhCn'].map(locale=>{
  const e=draft.editions?.[locale];if(!e||!Array.isArray(e.paragraphs)||e.paragraphs.length<2||e.paragraphs.length>8)throw Error('Invalid edition');
  return [locale,{title:e.title,summary:e.summary,slug:e.slug,body:e.paragraphs.map((text:string,i:number)=>({_type:'block',_key:'p'+i,style:'normal',markDefs:[],children:[{_type:'span',_key:'s'+i,text,marks:[]}]}))}];
 }))},evidence:draft.evidence.map((e:any)=>({url:e.url,quote:e.quote,contentHash:''}))};
}
export function verifyAndSign(candidate:ReturnType<typeof buildCandidate>,snapshots:Snapshot[],review:any,key:string,rightsReviewed:boolean){
 if(!rightsReviewed||!snapshots.some(s=>s.primary)||requiredChecks.filter(k=>k!=='sourceRights').some(k=>review?.[k]!==true))throw Error('Independent review refused');
 const evidence=candidate.evidence.map((e:any)=>{
  const s=snapshots.find(s=>s.url===e.url);if(!s||typeof e.quote!=='string'||e.quote.trim().length<8||e.quote.length>1000||!s.text.includes(e.quote)||s.hash!==createHash('sha256').update(s.text).digest('hex'))throw Error('Evidence snapshot mismatch');
  return {...e,contentHash:s.hash};
 });
 if(!evidence.some((e:any)=>snapshots.find(s=>s.url===e.url)?.primary))throw Error('Primary citation required');
 const unsigned={article:candidate.article,evidence};const hash=candidateHash(unsigned);
 const checks=Object.fromEntries(requiredChecks.map(k=>[k,k==='sourceRights'?rightsReviewed:review[k]]));
 const signed={...unsigned,report:signReport(hash,checks,new Date().toISOString(),key)};validateCandidate(signed,key);return signed;
}
export class Coordinator{
 private db:DatabaseSync;private busy=false;
 constructor(path:string,private processRun:(mode:'smoke'|'queue')=>Promise<any>,private enabled:boolean){
  this.db=new DatabaseSync(path);this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,mode TEXT,state TEXT,created_at INTEGER,finished_at INTEGER,result TEXT); CREATE TABLE IF NOT EXISTS controls(key TEXT PRIMARY KEY,value TEXT);');
  if(this.db.prepare("SELECT id FROM runs WHERE state='running' AND mode='queue' LIMIT 1").get())this.db.prepare("INSERT OR REPLACE INTO controls VALUES('safety_pause','Interrupted queue outcome; inspect D1 and CMS')").run();
  this.db.prepare("UPDATE runs SET state='interrupted',finished_at=? WHERE state='running'").run(Date.now());
 }
 history(){return this.db.prepare('SELECT id,mode,state,created_at,finished_at FROM runs ORDER BY created_at DESC LIMIT 20').all();}
 async tick(mode:'smoke'|'queue'){
  if(!['smoke','queue'].includes(mode))throw new Refused(400,'Unknown mode');
  if(this.busy)throw new Refused(409,'Coordinator busy');
  if(mode==='queue'&&(!this.enabled||this.db.prepare("SELECT value FROM controls WHERE key='safety_pause'").get()))return {state:'paused',reason:'Activation or safety pause; inspect D1 and CMS before resuming'};
  this.busy=true;const id=randomUUID(),now=Date.now();
  try{
   this.db.prepare('DELETE FROM runs WHERE created_at < ?').run(now-7*86400000);
   this.db.exec('DELETE FROM runs WHERE id NOT IN (SELECT id FROM runs ORDER BY created_at DESC LIMIT 999)');
   this.db.prepare("INSERT INTO runs(id,mode,state,created_at) VALUES(?,?,'running',?)").run(id,mode,now);
   let result;try{result=await this.processRun(mode);}catch{result={state:'failed',reason:'Processing failed; inspect private service diagnostics and worker status before retry'};}
   if(typeof result?.state!=='string')result={state:'failed',reason:'Invalid processor result'};
   if(result.state==='needs-attention')this.db.prepare("INSERT OR REPLACE INTO controls VALUES('safety_pause','Remote hold unconfirmed; inspect D1 and CMS')").run();
   this.db.prepare('UPDATE runs SET state=?,finished_at=?,result=? WHERE id=?').run(result.state,Date.now(),JSON.stringify(result),id);
   return {id,...result};
  }finally{this.busy=false;}
 }
 close(){this.db.close();}
}
