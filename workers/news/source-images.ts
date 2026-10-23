import {XMLParser} from 'fast-xml-parser';
import {imagePlan,type ImagePlan} from '../../frontend/src/lib/images/policy';
import inventory from '../../docs/research/source-checks/2026-10-22-fixed-sources.json';
import {limitedText} from './config';
export async function resolvePublishedImage(sourceUrl:string|undefined,slug:string,revision:string,title:string,collectorImage?:string):Promise<ImagePlan>{
 const fallback=imagePlan(sourceUrl,slug,revision,title);
 const permission=inventory.sources.some(s=>s.id==='panews'&&s.automation_enabled&&s.rights_status==='reviewed'&&s.allowed_reuse==='metadata-discovery'&&(s.review as {permission_status?:string}|undefined)?.permission_status==='owner-confirmed');
 if(!permission||!sourceUrl||!/^https:\/\/www\.panewslab\.com\/(?:en|zh)\/articles\/[a-f0-9-]{20,64}$/.test(sourceUrl))return fallback;
 if(collectorImage&&/^https:\/\/uploads\.panewslab\.com\/[a-f0-9-]{20,64}$/.test(collectorImage))return {url:collectorImage,alt:title,credit:'PANews',license:'Used with permission',sourceUrl,kind:'source'};
 try{
  const r=await fetch('https://www.panewslab.com/rss.xml?lang=en&type=NORMAL%2CNEWS%2CVIDEO',{headers:{'User-Agent':'TokenOnAirDiscovery/1.0'},redirect:'error',signal:AbortSignal.timeout(8000)});if(!r.ok)return fallback;
  const xml=await limitedText(r,1048576);
  const parsed=new XMLParser({ignoreAttributes:false,attributeNamePrefix:'@_',processEntities:false}).parse(xml);
  const items=parsed?.rss?.channel?.item;
  for(const item of (Array.isArray(items)?items:items?[items]:[])){
   if(item.link!==sourceUrl)continue;
   const media=item['media:content']||item.enclosure;
   const enclosure=Array.isArray(media)?media[0]:media;
   if(typeof enclosure?.['@_url']!=='string')return fallback;
   const url=new URL(enclosure['@_url'].replace(/&amp;/g,'&'));
   if(url.protocol!=='https:'||url.hostname!=='uploads.panewslab.com'||url.username||url.password||url.port||!/^\/[a-f0-9-]{20,64}$/.test(url.pathname)||url.search||url.hash)return fallback;
   return {url:url.href,alt:title,credit:'PANews',license:'Used with permission',sourceUrl,kind:'source'};
  }
 }catch{/* An unavailable source image must not block publication or a safe fallback. */}
 return fallback;
}
