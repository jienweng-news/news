import {parseFeed} from './feed';
import {safeFetch} from './network';
import {activeSource,sourceHosts,type Source} from './sources';
import {JobQueue} from './queue';
export async function pollSources(queue:JobQueue,sources:Source[],now=Date.now(),get= safeFetch){
 const results=[];
 for(const source of sources){
  if(!activeSource(source))continue;
  const state=queue.db.prepare('SELECT * FROM sources WHERE id=?').get(source.id) as any;
  if(state?.next_poll>now)continue;
  try{
   const headers:Record<string,string>={};if(state?.etag)headers['If-None-Match']=state.etag;if(state?.last_modified)headers['If-Modified-Since']=state.last_modified;
   const response=await get(source.resolved_url||source.url,sourceHosts(source),headers);
   if(![200,304].includes(response.status))throw new Error('Feed request failed');
   const items=response.status===304?[]:parseFeed(response.body,now);
   for(const item of items)queue.enqueue(source.id,item,now);
   const next=now+Math.max(5,source.proposed_poll_minutes)*60000+Math.floor(Math.random()*15000);
   queue.db.prepare('INSERT INTO sources(id,etag,last_modified,last_success,next_poll) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET etag=excluded.etag,last_modified=excluded.last_modified,last_success=excluded.last_success,last_error=NULL,next_poll=excluded.next_poll').run(source.id,response.headers.etag||state?.etag||null,response.headers['last-modified']||state?.last_modified||null,now,next);
   results.push({source:source.id,discovered:items.length,status:response.status});
  }catch{
   queue.db.prepare('INSERT INTO sources(id,last_error,next_poll) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET last_error=excluded.last_error,next_poll=excluded.next_poll').run(source.id,'Fetch/parse failed',now+900000);results.push({source:source.id,error:'Fetch/parse failed'});
  }
 }
 return results;
}
