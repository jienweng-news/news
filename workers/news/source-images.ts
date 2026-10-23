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
export function commonsSearchQuery(title:string,summary=''){
 const text=`${title} ${summary}`.toLowerCase();
 if(/forest|satellite|earth observation|land cover|climate|ecosystem|wildfire|habitat|biodiversity/.test(text))return 'satellite forest';
 if(/ultrasound|medical|healthcare|clinical|patient|diagnos|hospital|biomedical/.test(text))return 'medical technology';
 if(/semiconductor|memory chip|\bhbm\b|wafer|chip|foundry|gpu|processor/.test(text))return 'semiconductor chip';
 if(/bitcoin|\bbtc\b|\beth\b|crypto|blockchain|token|wallet|defi|dex|stablecoin|on-chain|protocol|bridge/.test(text))return 'cryptocurrency';
 if(/etf|market value|market cap|outflow|inflow|trading|gold price|interest rate|bond yield|stock market/.test(text))return 'stock market';
 if(/ai model|language model|\bllm\b|artificial intelligence|machine learning|ai agent|model release/.test(text))return 'artificial intelligence';
 if(/sec |regulat|legislation|policy|court|compliance|lawmakers|bill |sanction/.test(text))return 'technology regulation';
 if(/funding|acquisition|merger|company|business|revenue|startup|investment/.test(text))return 'technology company';
 return 'technology data center';
}
const pexelsPhotoId=(value:string)=>{try{const url=new URL(value);const last=url.pathname.split('/').filter(Boolean).at(-1)||'';return url.protocol==='https:'&&url.hostname==='www.pexels.com'&&!url.username&&!url.password&&!url.port&&/^photo-[a-z0-9-]+$/.test('photo-'+last)&&last.match(/-(\d+)$/)?.[1];}catch{return undefined;}};
const commonsFileTitle=(value:string)=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='commons.wikimedia.org'&&/^\/wiki\/File:[^/]+$/.test(url.pathname)?url.pathname.slice('/wiki/'.length):undefined;}catch{return undefined;}};
const metadataText=(value:string|undefined)=>value?.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim().slice(0,240);
const commonsLicense=(value:string)=>/^(?:CC BY [1-4](?:\.0)?|CC0(?: 1\.0)?)$/i.test(value.trim());
function commonsLicenseUrlMatches(license:string,value:string){
 try{
  const url=new URL(value);if(url.protocol!=='https:'||url.hostname!=='creativecommons.org'||url.username||url.password||url.port)return false;
  const path=url.pathname.replace(/\/+$/,'');
  const byVersion=/^CC BY ([1-4](?:\.0)?)$/i.exec(license.trim());if(byVersion)return path===`/licenses/by/${byVersion[1]}`;
  return /^CC0(?: 1\.0)?$/i.test(license.trim())&&path==='/publicdomain/zero/1.0';
 }catch{return false;}
}
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
async function commonsImage(title:string,summary:string,usedSources:string[]):Promise<ImagePlan|undefined>{
 try{
  const url=new URL('https://commons.wikimedia.org/w/api.php');
  for(const [key,value] of Object.entries({action:'query',generator:'search',gsrsearch:`filetype:bitmap ${commonsSearchQuery(title,summary)}`,gsrnamespace:'6',gsrlimit:'80',prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:'1200',format:'json',formatversion:'2'}))url.searchParams.set(key,value);
  const response=await fetch(url.href,{headers:{'User-Agent':'TokenOnAirNews/1.0 (editorial image discovery)','Accept':'application/json'},signal:AbortSignal.timeout(7000)});
  if(!response.ok||!response.headers.get('content-type')?.toLowerCase().includes('application/json'))return;
  const data=JSON.parse(await limitedText(response,1048576)) as {query?:{pages?:Array<{imageinfo?:Array<{thumburl?:string;width?:number;height?:number;descriptionurl?:string;extmetadata?:Record<string,{value?:string}>}>}>}};
  if(!Array.isArray(data.query?.pages))return;
  const used=new Set(usedSources.map(commonsFileTitle).filter((file):file is string=>!!file));
  for(const page of data.query.pages){
   const info=page.imageinfo?.[0],metadata=info?.extmetadata||{},sourceUrl=info?.descriptionurl||'',imageUrl=info?.thumburl||'',license=metadataText(metadata.LicenseShortName?.value)||'',licenseUrl=metadata.LicenseUrl?.value||'',artist=metadataText(metadata.Artist?.value)||'',description=metadataText(metadata.ImageDescription?.value)||'',file=commonsFileTitle(sourceUrl);
   if(!info||!file||used.has(file)||!commonsLicense(license)||!commonsLicenseUrlMatches(license,licenseUrl)||!artist||!Number.isFinite(info.width)||info.width!<1000||!Number.isFinite(info.height)||info.height!<500)continue;
   try{const image=new URL(imageUrl);if(image.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(image.hostname)||image.username||image.password||image.port)continue;}catch{continue;}
   return {url:imageUrl,alt:description||title,credit:`Photo by ${artist} on Wikimedia Commons`,license,sourceUrl,licenseUrl,provider:'commons',kind:'source'};
  }
 }catch{/* Open-license search is optional; the original illustration remains a safe fallback. */}
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
 if(fallback.kind==='illustration'&&fallback.url.includes('/api/images/'))return await pexelsImage(title,summary,pexelsApiKey,usedImageSources)||await commonsImage(title,summary,usedImageSources)||fallback;
 return fallback;
}
