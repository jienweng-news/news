import {imagePlan,type ImagePlan} from '../../frontend/src/lib/images/policy';
import inventory from '../../docs/research/source-checks/2026-10-22-fixed-sources.json';
import {limitedText} from './config';
export async function resolvePublishedImage(sourceUrl:string|undefined,slug:string,revision:string,title:string):Promise<ImagePlan>{
 const fallback=imagePlan(sourceUrl,slug,revision,title);
 const permission=inventory.sources.some(s=>s.id==='panews'&&s.automation_enabled&&s.rights_status==='reviewed'&&s.allowed_reuse==='metadata-discovery'&&(s.review as {permission_status?:string}|undefined)?.permission_status==='owner-confirmed');
 if(!permission||!sourceUrl||!/^https:\/\/www\.panewslab\.com\/(?:en|zh)\/articles\/[a-f0-9-]{20,64}$/.test(sourceUrl))return fallback;
 try{
  const r=await fetch(sourceUrl,{headers:{'User-Agent':'TokenOnAirDiscovery/1.0'},redirect:'error',signal:AbortSignal.timeout(8000)});if(!r.ok)return fallback;
  const html=await limitedText(r,1048576);
  for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){
   const attributes=Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(m=>[m[1].toLowerCase(),m[3]]));
   if(attributes.property!=='og:image'||!attributes.content)continue;
   const url=new URL(attributes.content.replace(/&amp;/g,'&'));
   if(url.protocol!=='https:'||url.hostname!=='uploads.panewslab.com'||url.username||url.password||url.port||!/^\/[a-f0-9-]{20,64}$/.test(url.pathname)||url.search||url.hash)return fallback;
   return {url:url.href,alt:title,credit:'PANews',license:'Used with permission',sourceUrl,kind:'source'};
  }
 }catch{/* An unavailable source image must not block publication or a safe fallback. */}
 return fallback;
}
