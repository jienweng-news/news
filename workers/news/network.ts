import inventory from '../../docs/research/source-checks/2026-10-22-fixed-sources.json';
import {limitedText,Refused} from './config';
interface FeedSource {id:string;url:string;resolved_url?:string|null}
export const MAX_FEED_BYTES=65536;
// Only the bundled inventory may be fetched. D1 is not an arbitrary URL proxy.
export async function fetchFeed(source:FeedSource,headers:Record<string,string>={},get:typeof fetch=fetch){
 const known=inventory.sources.find(s=>s.id===source.id);
 if(!known||source.url!==known.url||(source.resolved_url&&source.resolved_url!==known.resolved_url))throw new Refused(400,'Unknown source destination');
 const hosts=new Set([known.url,known.resolved_url].filter(Boolean).map(u=>new URL(u!).hostname));
 let url=new URL(source.resolved_url||source.url);const signal=AbortSignal.timeout(10000);
 for(let i=0;i<=3;i++){
  if(url.protocol!=='https:'||url.username||url.password||url.port||!hosts.has(url.hostname))throw new Refused(400,'Source redirect refused');
  const r=await get(url.href,{headers:{Accept:'application/rss+xml, application/atom+xml, application/xml, text/xml',...headers},redirect:'manual',signal});
  if([301,302,303,307,308].includes(r.status)){await r.body?.cancel();const next=r.headers.get('Location');if(!next)break;url=new URL(next,url);continue;}
  if(r.status!==200){await r.body?.cancel();return {status:r.status,headers:r.headers,body:''};}
  return {status:r.status,headers:r.headers,body:await limitedText(r,MAX_FEED_BYTES)};
 }
 throw new Refused(502,'Source redirect limit');
}
