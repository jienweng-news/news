import {DatabaseSync} from 'node:sqlite';import {canonicalItemUrl,parseFeed,type FeedItem} from '../feed';
import {activeSource,sourceHosts,type Source} from '../sources';import {safeFetch} from '../network';
export function metadataBatches(source:string,items:FeedItem[]){
 const batches:{source:string;items:FeedItem[]}[]=[];let current:FeedItem[]=[];
 for(const item of items){if(Buffer.byteLength(JSON.stringify({source,items:[item]}))>60000)throw Error('Metadata item too large');if(current.length&&(current.length>=50||Buffer.byteLength(JSON.stringify({source,items:[...current,item]}))>60000)){batches.push({source,items:current});current=[];}current.push(item);}
 if(current.length)batches.push({source,items:current});return batches;
}
export function groupLeads(rows:Array<FeedItem&{source:string}>){
 const canonical=new Map<string,FeedItem&{source:string;sources:string[]}>();
 for(const r of rows){const url=canonicalItemUrl(r.url);const previous=canonical.get(url);if(previous){if(!previous.sources.includes(r.source))previous.sources.push(r.source);}else canonical.set(url,{...r,url,sources:[r.source]});}
 const unique=[...canonical.values()];const titles=new Map<string,typeof unique>();
 for(const r of unique){const title=r.title.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]+/gu,' ').trim();if(title.length<25)continue;const g=titles.get(title)||[];g.push(r);titles.set(title,g);}
 return {unique,related:[...titles.values()].filter(g=>g.length>1).map(g=>({title:g[0].title,urls:g.map(r=>r.url),sources:[...new Set(g.flatMap(r=>r.sources))],decision:'related-leads-only; verify event identity before publication'}))};
}
export function robotsAllow(body:string,value:string){
 const groups:Array<{agents:string[];rules:Array<{allow:boolean;path:string}>}>=[];let group={agents:[] as string[],rules:[] as Array<{allow:boolean;path:string}>};
 for(const raw of body.split(/\r?\n/)){const line=raw.split('#')[0].trim();const i=line.indexOf(':');if(i<0)continue;const key=line.slice(0,i).trim().toLowerCase(),v=line.slice(i+1).trim();if(key==='user-agent'){if(group.rules.length){groups.push(group);group={agents:[],rules:[]};}group.agents.push(v.toLowerCase());}else if(['allow','disallow'].includes(key)&&group.agents.length&&v)group.rules.push({allow:key==='allow',path:v});}if(group.agents.length)groups.push(group);
 const specific=groups.filter(g=>g.agents.some(a=>a!=='*'&&'tokenonairdiscovery'.includes(a)));const selected=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
 const url=new URL(value),path=url.pathname+url.search;let matched=-1,allowed=true;
 for(const rule of selected.flatMap(g=>g.rules)){
  const pattern=rule.path.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\\\$$/,'$');
  if(new RegExp('^'+pattern).test(path)){const length=rule.path.replace(/\*/g,'').length;if(length>matched||(length===matched&&rule.allow)){matched=length;allowed=rule.allow;}}
 }return allowed;
}
type Get=typeof safeFetch;
export class Collector{
 private db:DatabaseSync;
 constructor(path:string,private sources:Source[],private send:(batch:ReturnType<typeof metadataBatches>[number],signal:AbortSignal)=>Promise<unknown>,private get:Get=safeFetch,private now=Date.now){
  this.db=new DatabaseSync(path);this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS feeds(id TEXT PRIMARY KEY,next_poll INTEGER,etag TEXT,last_modified TEXT,error TEXT); CREATE TABLE IF NOT EXISTS leads(url TEXT PRIMARY KEY,source TEXT,payload TEXT,published_at INTEGER); CREATE TABLE IF NOT EXISTS robots(host TEXT PRIMARY KEY,body TEXT,expires INTEGER);');
 }
 async canAccess(value:string,signal:AbortSignal){
  const host=new URL(value).hostname;const source=this.sources.find(s=>sourceHosts(s).has(host)&&(activeSource(s)||(s.monitoring_enabled===true&&[s.url,s.resolved_url].includes(value))));if(!source)return false;
  let row=this.db.prepare('SELECT body,expires FROM robots WHERE host=?').get(host) as any;
  if(!row||row.expires<=this.now()){
   const r=await this.get('https://'+host+'/robots.txt',sourceHosts(source),{},0,signal);
   if(![200,404].includes(r.status)||Buffer.byteLength(r.body)>65536)throw Error('Robots policy unavailable');const body=r.status===404?'':r.body;
   this.db.prepare('INSERT OR REPLACE INTO robots VALUES(?,?,?)').run(host,body,this.now()+86400000);row={body};
  }return robotsAllow(row.body,value);
 }
 context(){return this.db.prepare('SELECT source,payload FROM (SELECT source,payload,published_at,ROW_NUMBER() OVER(PARTITION BY source ORDER BY published_at DESC) AS n FROM leads WHERE published_at>=?) WHERE n<=10 ORDER BY published_at DESC LIMIT 250').all(this.now()-48*3600000).map((r:any)=>({...JSON.parse(r.payload),source:r.source}));}
 checkpoints(){return this.db.prepare('SELECT id,next_poll,error FROM feeds ORDER BY id').all();}
 async poll(signal:AbortSignal){
  const active=this.sources.filter(s=>activeSource(s)||s.monitoring_enabled===true);let index=0;let discovered=0;
  await Promise.all(Array.from({length:Math.min(3,active.length)},async()=>{while(index<active.length){const source=active[index++];signal.throwIfAborted();const now=this.now();
   this.db.prepare('INSERT OR IGNORE INTO feeds(id,next_poll) VALUES(?,0)').run(source.id);
   const prior=this.db.prepare('SELECT * FROM feeds WHERE id=?').get(source.id) as any;
   if(!this.db.prepare('UPDATE feeds SET next_poll=? WHERE id=? AND next_poll<=? RETURNING id').get(now+900000,source.id,now))continue;
   try{
    const url=source.resolved_url||source.url;if(!await this.canAccess(url,signal))throw Error('Robots disallows source');
    const headers:Record<string,string>={};if(prior.etag)headers['If-None-Match']=prior.etag;if(prior.last_modified)headers['If-Modified-Since']=prior.last_modified;
    const r=await this.get(url,sourceHosts(source),headers,0,signal);if(![200,304].includes(r.status))throw Error('Feed unavailable');
    const items=r.status===304?[]:parseFeed(r.body,now).filter(i=>sourceHosts(source).has(new URL(i.url).hostname));
    if(activeSource(source))for(const batch of metadataBatches(source.id,items))await this.send(batch,signal);
    const upsert=this.db.prepare('INSERT OR REPLACE INTO leads VALUES(?,?,?,?)');for(const item of items)upsert.run(item.url,source.id,JSON.stringify(item),Date.parse(item.publishedAt));
    this.db.prepare('UPDATE feeds SET next_poll=?,etag=?,last_modified=?,error=NULL WHERE id=?').run(now+Math.max(5,source.proposed_poll_minutes)*60000,r.headers.etag||prior.etag||null,r.headers['last-modified']||prior.last_modified||null,source.id);discovered+=items.length;
   }catch{this.db.prepare('UPDATE feeds SET next_poll=?,error=? WHERE id=?').run(now+900000,'Fetch/policy/ingest failed; bounded backoff',source.id);}
  }}));
  this.db.prepare('DELETE FROM leads WHERE published_at<?').run(this.now()-7*86400000);return {discovered,sources:active.length};
 }
 close(){this.db.close();}
}
