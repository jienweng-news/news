import {imagePlan,type ImagePlan} from '../../frontend/src/lib/images/policy';
import inventory from '../../docs/research/source-checks/2026-10-22-fixed-sources.json';
import {limitedText} from './config';
const sourceImageUrl=(value:string)=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='uploads.panewslab.com'&&!url.username&&!url.password&&!url.port&&/^\/[a-f0-9-]{20,64}$/.test(url.pathname)&&!url.search&&!url.hash?url.href:undefined;}catch{return undefined;}};
export function parsePanewsArticleImage(html:string):string|undefined{
 const article=/<article\b(?=[^>]*\bclass=["'][^"']*\barticle-content\b[^"']*["'])[^>]*>([\s\S]*?)<\/article>/i.exec(html)?.[1];if(!article)return;
 for(const tag of article.matchAll(/<img\b[^>]*>/gi)){const src=/\bsrc\s*=\s*(["'])(.*?)\1/i.exec(tag[0])?.[2];if(src){const url=sourceImageUrl(src.replace(/&amp;/g,'&'));if(url)return url;}}
}
const panewsArticleHost=(url:URL)=>(url.hostname==='www.panewslab.com'&&/^\/(?:en|zh)\/articles\/[a-f0-9-]{20,64}$/.test(url.pathname))||(['panews.io','www.panews.io'].includes(url.hostname)&&/^\/(?:articles|(?:en|zh)\/articles)\/[a-f0-9-]{20,64}$/.test(url.pathname));
export async function resolvePublishedImage(sourceUrl:string|undefined,slug:string,revision:string,title:string):Promise<ImagePlan>{
 const fallback=imagePlan(sourceUrl,slug,revision,title);
 const permission=inventory.sources.some(s=>s.id==='panews'&&s.automation_enabled&&s.rights_status==='reviewed'&&s.allowed_reuse==='metadata-discovery'&&(s.review as {permission_status?:string}|undefined)?.permission_status==='owner-confirmed');
 if(!permission||!sourceUrl||!/^https:\/\/www\.panewslab\.com\/(?:en|zh)\/articles\/[a-f0-9-]{20,64}$/.test(sourceUrl))return fallback;
 try{
  let target=new URL(sourceUrl),r:Response|undefined;
  for(let redirects=0;redirects<4;redirects++){
   if(!panewsArticleHost(target))return fallback;
   r=await fetch(target.href,{headers:{'User-Agent':'TokenOnAirDiscovery/1.0','Accept':'text/html'},redirect:'manual',signal:AbortSignal.timeout(8000)});
   if(r.status<300||r.status>=400)break;
   const location=r.headers.get('location');if(!location)return fallback;target=new URL(location,target);
  }
  if(!r?.ok||!r.headers.get('content-type')?.toLowerCase().includes('text/html'))return fallback;
  const html=await limitedText(r,1048576),image=parsePanewsArticleImage(html);if(!image)return fallback;
  return {url:image,alt:title,credit:'PANews',license:'Used with permission',sourceUrl,kind:'source'};
 }catch{/* An unavailable source image must not block publication or a safe fallback. */}
 return fallback;
}
