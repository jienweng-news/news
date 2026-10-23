import {imagePlan,type ImagePlan} from '../../frontend/src/lib/images/policy';
import inventory from '../../docs/research/source-checks/2026-10-22-fixed-sources.json';
import {limitedText} from './config';
const sourceImageUrl=(value:string)=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='uploads.panewslab.com'&&!url.username&&!url.password&&!url.port&&/^\/[a-f0-9-]{20,64}$/.test(url.pathname)&&!url.search&&!url.hash?url.href:undefined;}catch{return undefined;}};
export function parsePanewsArticleImage(html:string):string|undefined{
 const article=/<article\b(?=[^>]*\bclass=["'][^"']*\barticle-content\b[^"']*["'])[^>]*>([\s\S]*?)<\/article>/i.exec(html)?.[1];if(!article)return;
 for(const tag of article.matchAll(/<img\b[^>]*>/gi)){const src=/\bsrc\s*=\s*(["'])(.*?)\1/i.exec(tag[0])?.[2];if(src){const url=sourceImageUrl(src.replace(/&amp;/g,'&'));if(url)return url;}}
}
const panewsArticleHost=(url:URL)=>(url.hostname==='www.panewslab.com'&&/^\/(?:en|zh)\/articles\/[a-f0-9-]{20,64}$/.test(url.pathname))||(['panews.io','www.panews.io'].includes(url.hostname)&&/^\/(?:articles|(?:en|zh)\/articles)\/[a-f0-9-]{20,64}$/.test(url.pathname));
export function pexelsSearchQuery(title:string,summary=''){
 const text=`${title} ${summary}`.toLowerCase();
 if(/forest|satellite|earth observation|land cover|climate|ecosystem|wildfire|habitat|biodiversity/.test(text))return 'aerial forest';
 if(/ultrasound|medical|healthcare|clinical|patient|diagnos|hospital|biomedical/.test(text))return 'medical ultrasound';
 if(/semiconductor|memory chip|\bhbm\b|wafer|chip|foundry|gpu|processor/.test(text))return 'semiconductor chip';
 if(/bitcoin|\bbtc\b|\beth\b|crypto|blockchain|token|wallet|defi|dex|stablecoin|on-chain|protocol|bridge/.test(text))return 'cryptocurrency finance';
 if(/etf|market value|market cap|outflow|inflow|trading|gold price|interest rate|bond yield|stock market/.test(text))return 'financial markets';
 if(/ai model|language model|\bllm\b|artificial intelligence|machine learning|ai agent|model release/.test(text))return 'artificial intelligence';
 if(/sec |regulat|legislation|policy|court|compliance|lawmakers|bill |sanction/.test(text))return 'financial regulation';
 if(/funding|acquisition|merger|company|business|revenue|startup|investment/.test(text))return 'technology business';
 return 'technology data center';
}
const pexelsPhotoId=(value:string)=>{try{const url=new URL(value);const last=url.pathname.split('/').filter(Boolean).at(-1)||'';return url.protocol==='https:'&&url.hostname==='www.pexels.com'&&!url.username&&!url.password&&!url.port&&/^photo-[a-z0-9-]+$/.test('photo-'+last)&&last.match(/-(\d+)$/)?.[1];}catch{return undefined;}};
async function pexelsImage(title:string,summary:string,key:string|undefined,usedSources:string[]):Promise<ImagePlan|undefined>{
 if(!key||key.length>512)return;
 try{
  const query=pexelsSearchQuery(title,summary),url=new URL('https://api.pexels.com/v1/search');url.searchParams.set('query',query);url.searchParams.set('orientation','landscape');url.searchParams.set('per_page','80');
  const response=await fetch(url.href,{headers:{Authorization:key,Accept:'application/json'},signal:AbortSignal.timeout(5000)});
  if(!response.ok||!response.headers.get('content-type')?.toLowerCase().includes('application/json'))return;
  const data=JSON.parse(await limitedText(response,524288)) as {photos?:Array<{id?:number;width?:number;height?:number;url?:string;photographer?:string;src?:{landscape?:string;large?:string}}>};
  if(!Array.isArray(data.photos))return;
  const used=new Set(usedSources.map(pexelsPhotoId).filter((id):id is string=>!!id));
  for(const photo of data.photos){
   const id=Number.isSafeInteger(photo.id)?String(photo.id):undefined,sourceUrl=photo.url||'',photoId=pexelsPhotoId(sourceUrl),imageUrl=photo.src?.landscape||photo.src?.large;
   if(!id||photoId!==id||used.has(id)||!Number.isFinite(photo.width)||photo.width!<1000||!Number.isFinite(photo.height)||photo.height!<500||!photo.photographer)continue;
   try{const image=new URL(imageUrl||'');if(image.protocol!=='https:'||image.hostname!=='images.pexels.com'||image.username||image.password||image.port)continue;}catch{continue;}
   return {url:imageUrl!,alt:title,credit:`Photo by ${photo.photographer} on Pexels`,license:'Pexels License',sourceUrl,licenseUrl:'https://www.pexels.com/license/',provider:'pexels',kind:'source'};
  }
 }catch{/* Stock search is optional; the original illustration remains a safe fallback. */}
}
export async function resolvePublishedImage(sourceUrl:string|undefined,slug:string,revision:string,title:string,summary='',pexelsApiKey?:string,usedImageSources:string[]=[]):Promise<ImagePlan>{
 const fallback=imagePlan(sourceUrl,slug,revision,title);
 const permission=inventory.sources.some(s=>s.id==='panews'&&s.automation_enabled&&s.rights_status==='reviewed'&&s.allowed_reuse==='metadata-discovery'&&(s.review as {permission_status?:string}|undefined)?.permission_status==='owner-confirmed');
 if(permission&&sourceUrl&&/^https:\/\/www\.panewslab\.com\/(?:en|zh)\/articles\/[a-f0-9-]{20,64}$/.test(sourceUrl))try{
  let target=new URL(sourceUrl),r:Response|undefined,allowed=true;
  for(let redirects=0;redirects<4;redirects++){
   if(!panewsArticleHost(target)){allowed=false;break;}
   r=await fetch(target.href,{headers:{'User-Agent':'TokenOnAirDiscovery/1.0','Accept':'text/html'},redirect:'manual',signal:AbortSignal.timeout(8000)});
   if(r.status<300||r.status>=400)break;
   const location=r.headers.get('location');if(!location){allowed=false;break;}target=new URL(location,target);
  }
  if(allowed&&r?.ok&&r.headers.get('content-type')?.toLowerCase().includes('text/html')){
   const html=await limitedText(r,1048576),image=parsePanewsArticleImage(html);
   if(image)return {url:image,alt:title,credit:'PANews',license:'Used with permission',sourceUrl,kind:'source'};
  }
 }catch{/* An unavailable source image must not block publication or a safe fallback. */}
 if(fallback.kind==='illustration'&&fallback.url.includes('/api/images/'))return await pexelsImage(title,summary,pexelsApiKey,usedImageSources)||fallback;
 return fallback;
}
