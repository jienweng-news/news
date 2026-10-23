import {imagePlan,rejectedImageSources,type ImagePlan} from '../../frontend/src/lib/images/policy';
import inventory from '../../docs/research/source-checks/2026-10-22-fixed-sources.json';
import {limitedText} from './config';
const sourceImageUrl=(value:string)=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='uploads.panewslab.com'&&!url.username&&!url.password&&!url.port&&/^\/[a-f0-9-]{20,64}$/.test(url.pathname)&&!url.search&&!url.hash?url.href:undefined;}catch{return undefined;}};
export function parsePanewsArticleImage(html:string):string|undefined{
 const article=/<article\b(?=[^>]*\bclass=["'][^"']*\barticle-content\b[^"']*["'])[^>]*>([\s\S]*?)<\/article>/i.exec(html)?.[1];if(!article)return;
 for(const tag of article.matchAll(/<img\b[^>]*>/gi)){const src=/\bsrc\s*=\s*(["'])(.*?)\1/i.exec(tag[0])?.[2];if(src){const url=sourceImageUrl(src.replace(/&amp;/g,'&'));if(url)return url;}}
}
function panewsFeedItems(xml:string){return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(match=>match[1]);}
export function panewsFeedImageUseCount(xml:string,imageUrl:string){return panewsFeedItems(xml).filter(body=>body.includes(imageUrl)).length;}
export function parsePanewsFeedImage(xml:string,articleUrl:string):string|undefined{
 const items=panewsFeedItems(xml);
 const item=items.find(body=>{
  const link=/<link\b[^>]*>([\s\S]*?)<\/link>/i.exec(body)?.[1]?.trim().replace(/&amp;/g,'&');
  return link===articleUrl;
 });
 if(!item)return;
 const media=/<media:content\b[^>]*\burl=["']([^"']+)["'][^>]*\bmedium=["']image["'][^>]*>/i.exec(item)?.[1]||/<media:thumbnail\b[^>]*\burl=["']([^"']+)["']/i.exec(item)?.[1];
 if(media){const image=sourceImageUrl(media.replace(/&amp;/g,'&'));if(image&&panewsFeedImageUseCount(xml,media)===1)return image;}
 const content=/<content:encoded\b[^>]*>([\s\S]*?)<\/content:encoded>/i.exec(item)?.[1];
 if(content){const src=/\bsrc\s*=\s*(["'])(.*?)\1/i.exec(content)?.[2];if(src){const image=sourceImageUrl(src.replace(/&amp;/g,'&'));if(image&&panewsFeedImageUseCount(xml,image)<2)return image;}}
}
const panewsArticleHost=(url:URL)=>(url.hostname==='www.panewslab.com'&&/^\/(?:en|zh)\/articles\/[a-f0-9-]{20,64}$/.test(url.pathname))||(['panews.io','www.panews.io'].includes(url.hostname)&&/^\/(?:articles|(?:en|zh)\/articles)\/[a-f0-9-]{20,64}$/.test(url.pathname));
export function pexelsSearchQuery(title:string,summary=''){
 const text=`${title} ${summary}`.toLowerCase();
 if(/gold|bullion|precious metal/.test(text))return 'gold bullion bar';
 if(/bridge|hack|exploit|security incident|unauthorized mint|attack|breach/.test(text)&&/crypto|cryptocurr|blockchain|token|on-chain|cross-chain/.test(text))return 'blockchain bridge security';
 if(/forest|satellite|earth observation|land cover|climate|ecosystem|wildfire|habitat|biodiversity/.test(text))return 'forest canopy';
 if(/ultrasound|pregnan|fetal|maternal|medical|healthcare|clinical|patient|diagnos|hospital|biomedical/.test(text))return 'pregnancy ultrasound';
 if(/semiconductor|memory chip|\bhbm\b|wafer|chip|foundry|gpu|processor/.test(text))return 'semiconductor chip';
 if(/bitcoin|\bbtc\b/.test(text))return 'bitcoin';
 if(/ethereum|\beth\b|hoodi|glamsterdam/.test(text))return 'ethereum coin close up';
 if(/\beth\b|crypto|blockchain|token|wallet|defi|dex|stablecoin|on-chain|protocol|bridge/.test(text))return 'cryptocurrency finance';
 if(/etf|market value|market cap|outflow|inflow|trading|gold price|interest rate|bond yield|stock market/.test(text))return 'financial markets';
 if(/ai model|language model|\bllm\b|artificial intelligence|machine learning|\bai\b|research|model release/.test(text))return 'data center server racks';
 if(/sec |regulat|legislation|policy|court|compliance|lawmakers|bill |sanction/.test(text))return 'financial regulation';
 if(/funding|acquisition|merger|company|business|revenue|startup|investment/.test(text))return 'technology business';
 return 'technology data center';
}
export function commonsSearchQuery(title:string,summary=''){
 const text=`${title} ${summary}`.toLowerCase();
 if(/gold|bullion|precious metal/.test(text))return 'gold bullion bar';
 if(/bridge|hack|exploit|security incident|unauthorized mint|attack|breach/.test(text)&&/crypto|cryptocurr|blockchain|token|on-chain|cross-chain/.test(text))return 'blockchain bridge security';
 if(/forest|satellite|earth observation|land cover|climate|ecosystem|wildfire|habitat|biodiversity/.test(text))return 'forest canopy';
 if(/ultrasound|pregnan|fetal|maternal/.test(text))return 'ultrasound scan fetal';
 if(/medical|healthcare|clinical|patient|diagnos|hospital|biomedical/.test(text))return 'medical ultrasound examination';
 if(/semiconductor|memory chip|\bhbm\b|wafer|chip|foundry|gpu|processor/.test(text))return 'semiconductor chip';
 if(/bitcoin|\bbtc\b/.test(text))return 'bitcoin';
 if(/ethereum|\beth\b|hoodi|glamsterdam/.test(text))return 'ethereum coin close up';
 if(/\bcrypto\b|cryptocurr|blockchain|token|wallet|defi|dex|stablecoin|on-chain|protocol|bridge/.test(text)&&/security|incident|exploit|hack|attack|breach|burn/.test(text))return 'cryptocurrency mining machine';
 if(/\beth\b|crypto|blockchain|token|wallet|defi|dex|stablecoin|on-chain|protocol|bridge|hyperliquid|\bhype\b/.test(text))return 'cryptocurrency';
 if(/etf|market value|market cap|outflow|inflow|trading|gold price|interest rate|bond yield|stock market/.test(text))return 'stock market trading screen';
 if(/ai model|language model|\bllm\b|artificial intelligence|machine learning|\bai\b|research|model release/.test(text))return 'data center server racks';
 if(/sec |regulat|legislation|policy|court|compliance|lawmakers|bill |sanction/.test(text))return 'technology regulation';
 if(/changpeng|\bcz\b/.test(text))return 'Changpeng Zhao';
 if(/founder|funding|acquisition|merger|company|business|revenue|startup|investment/.test(text))return 'technology startup founder';
 return 'technology data center';
}
const pexelsPhotoId=(value:string)=>{try{const url=new URL(value);const last=url.pathname.split('/').filter(Boolean).at(-1)||'';return url.protocol==='https:'&&url.hostname==='www.pexels.com'&&!url.username&&!url.password&&!url.port&&/^photo-[a-z0-9-]+$/.test('photo-'+last)&&last.match(/-(\d+)$/)?.[1];}catch{return undefined;}};
const commonsFileTitle=(value:string)=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='commons.wikimedia.org'&&!url.username&&!url.password&&!url.port&&!url.search&&!url.hash&&/^\/wiki\/File:[^/]+$/.test(url.pathname)?url.pathname.slice('/wiki/'.length):undefined;}catch{return undefined;}};
const metadataText=(value:string|undefined)=>value?.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim().slice(0,240);
const commonsLicense=(value:string)=>/^(?:CC BY [1-4](?:\.0)?|CC0(?: 1\.0)?)$/i.test(value.trim());
function commonsRelevant(topic:string,asset:string){
 if(/prompt:|image for blogs|graphic|illustration|infographic|digital art|computer-generated|concept art|rendered|clipart|vector image|ai-generated/.test(asset))return false;
 if(/bridge|hack|exploit|security incident|unauthorized mint|attack|breach/.test(topic)&&/crypto|cryptocurr|blockchain|token|on-chain|cross-chain/.test(topic))return /blockchain|crypto|cryptocurr|digital asset/.test(asset)&&/bridge|security|exploit|hack|attack|incident/.test(asset)&&!/mining|miner|gpu farm/.test(asset);
 if(/gold|bullion|precious metal/.test(topic))return /gold|bullion|precious metal/.test(asset)&&!/stock market|stock exchange|nasdaq/.test(asset);
 if(/\bbitcoin\b|\bbtc\b/.test(topic))return /bitcoin|\bbtc\b|bitcoin coin|digital currency/.test(asset)&&!/regulation|regulatory|laws?|gavel/.test(asset);
 if(/\bethereum\b|\beth\b/.test(topic))return /ethereum|\beth\b|ether coin/.test(asset);
 const patterns:[RegExp,RegExp][]=[
  [/forest|satellite|earth observation|land cover|climate|ecosystem|wildfire|habitat|biodiversity/,/forest|woodland|tree|canopy|rainforest/],
  [/ultrasound|pregnan|fetal|maternal|medical|healthcare|clinical|patient|diagnos|hospital|biomedical/,/ultrasound|sonogram|fetal|pregnan|obstetric|medical/],
  [/semiconductor|memory chip|\bhbm\b|wafer|chip|foundry|gpu|processor/,/semiconductor|integrated circuit|\bchips?\b|wafer|processor/],
  [/bitcoin|\bbtc\b|ethereum|\beth\b|hoodi|glamsterdam|crypto|blockchain|token|wallet|defi|dex|stablecoin|on-chain|protocol|bridge|hyperliquid|\bhype\b/,/bitcoin|cryptocurr|crypto|blockchain|ethereum|digital asset|mining equipment/],
  [/changpeng|\bcz\b|founder|startup|entrepreneur/,/changpeng|binance|startup|founder|entrepreneur/],
  [/etf|market value|market cap|outflow|inflow|trading|gold price|interest rate|bond yield|stock market/,/market|stock|exchange|trading|financial|nasdaq|nyse|bourse/],
  [/ai model|language model|\bllm\b|artificial intelligence|machine learning|\bai\b|research/,/data center|server|rack|technician|computer/],
  [/sec |regulat|legislation|policy|court|compliance|lawmakers|bill |sanction/,/regulat|law|court|government|policy/],
 ];
 const category=patterns.find(([matcher])=>matcher.test(topic));return category?category[1].test(asset):/technology|data center|computer|server/.test(asset);
}
function commonsLicenseUrlMatches(license:string,value:string){
 try{
  const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||url.hostname!=='creativecommons.org'||url.username||url.password||url.port)return false;
  const path=url.pathname.replace(/\/+$/,'');
  const byVersion=/^CC BY ([1-4](?:\.0)?)$/i.exec(license.trim());if(byVersion)return url.protocol==='https:'&&path===`/licenses/by/${byVersion[1]}`;
  return /^CC0(?: 1\.0)?$/i.test(license.trim())&&path.startsWith('/publicdomain/zero/1.0');
 }catch{return false;}
}
export function validateSourceImagePlan(value:unknown,discoveryUrl:string):ImagePlan|undefined{
 if(!value||typeof value!=='object')return;
 const input=value as Record<string,unknown>,url=typeof input.url==='string'?input.url:'',alt=typeof input.alt==='string'?input.alt:'',credit=typeof input.credit==='string'?input.credit:'',license=typeof input.license==='string'?input.license:'',sourceUrl=typeof input.sourceUrl==='string'?input.sourceUrl:'',licenseUrl=typeof input.licenseUrl==='string'?input.licenseUrl:undefined;
 if(!url||url.length>2048||!alt.trim()||alt.length>500||!credit.trim()||credit.length>300||!sourceUrl||sourceUrl.length>2048)return;
 const media=(host:string,path:RegExp,query=false)=>{try{const u=new URL(url);return u.protocol==='https:'&&u.hostname===host&&!u.username&&!u.password&&!u.port&&(!u.search||query)&&!u.hash&&path.test(u.pathname);}catch{return false;}};
 const commonsFile=commonsFileTitle(sourceUrl);
 if(commonsFile&&commonsLicense(license)&&commonsLicenseUrlMatches(license,licenseUrl||'')&&/^Photo by .+ on Wikimedia Commons$/.test(credit)&&media('upload.wikimedia.org',/^\/wikipedia\/commons\/(?:thumb\/)?[A-Za-z0-9_%./-]+\.(?:jpe?g|png|webp)$/i))return {url,alt,credit,license,sourceUrl,licenseUrl,provider:'commons',kind:'source'};
 if(pexelsPhotoId(sourceUrl)&&license==='Pexels License'&&licenseUrl==='https://www.pexels.com/license/'&&/^Photo by .+ on Pexels$/.test(credit)&&media('images.pexels.com',/^\/photos\/[A-Za-z0-9_%./-]+\.(?:jpe?g|png|webp)$/i,true))return {url,alt,credit,license,sourceUrl,licenseUrl,provider:'pexels',kind:'source'};
 const panews=inventory.sources.find(s=>s.id==='panews'&&s.automation_enabled&&s.rights_status==='reviewed'&&s.allowed_reuse==='metadata-discovery'&&(s.review as {permission_status?:string}|undefined)?.permission_status==='owner-confirmed');
 const originalImageUrl=typeof input.originalImageUrl==='string'?input.originalImageUrl:undefined;
 if(panews&&sourceUrl===discoveryUrl&&sourceImageUrl(url)&&sourceImageUrl(originalImageUrl||'')===url&&license==='Used with permission'&&credit==='PANews')return {url,alt,credit,license,sourceUrl,originalImageUrl,kind:'source'};
 return;
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
 }catch{/* Stock-photo search is optional. */}
}
async function commonsImage(title:string,summary:string,usedSources:string[]):Promise<ImagePlan|undefined>{
 try{
  const url=new URL('https://commons.wikimedia.org/w/api.php');
  for(const [key,value] of Object.entries({action:'query',generator:'search',gsrsearch:`filetype:bitmap ${commonsSearchQuery(title,summary)}`,gsrnamespace:'6',gsrlimit:'30',prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:'1200',format:'json',formatversion:'2'}))url.searchParams.set(key,value);
  const response=await fetch(url.href,{headers:{'User-Agent':'TokenOnAirNews/1.0 (editorial image discovery)','Accept':'application/json'},signal:AbortSignal.timeout(7000)});
  if(!response.ok||!response.headers.get('content-type')?.toLowerCase().includes('application/json'))return;
  const data=JSON.parse(await limitedText(response,1048576)) as {query?:{pages?:Array<{title?:string;imageinfo?:Array<{thumburl?:string;width?:number;height?:number;descriptionurl?:string;extmetadata?:Record<string,{value?:string}>}>}>}};
  if(!Array.isArray(data.query?.pages))return;
  const used=new Set(usedSources.map(commonsFileTitle).filter((file):file is string=>!!file));
  for(const page of data.query.pages){
   const info=page.imageinfo?.[0],metadata=info?.extmetadata||{},sourceUrl=info?.descriptionurl||'',imageUrl=info?.thumburl||'',license=metadataText(metadata.LicenseShortName?.value)||'',licenseUrl=metadata.LicenseUrl?.value||'',artist=metadataText(metadata.Artist?.value)||'',description=metadataText(metadata.ImageDescription?.value)||'',file=commonsFileTitle(sourceUrl),topic=`${title} ${summary}`.toLowerCase(),asset=`${page.title} ${description}`.toLowerCase();
   if(!info||!file||used.has(file)||!commonsRelevant(topic,asset)||!commonsLicense(license)||!commonsLicenseUrlMatches(license,licenseUrl)||!artist||!Number.isFinite(info.width)||info.width!<1000||!Number.isFinite(info.height)||info.height!<500)continue;
   let safeImageUrl:string;try{const image=new URL(imageUrl);if(image.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(image.hostname)||image.username||image.password||image.port)continue;image.search='';safeImageUrl=image.href;}catch{continue;}
   const safeLicenseUrl=/^CC0(?: 1\.0)?$/i.test(license)?'https://creativecommons.org/publicdomain/zero/1.0/':licenseUrl;
   return {url:safeImageUrl,alt:description||title,credit:`Photo by ${artist} on Wikimedia Commons`,license,sourceUrl,licenseUrl:safeLicenseUrl,provider:'commons',kind:'source'};
  }
 }catch{/* Open-license search is optional. */}
}
export async function resolvePublishedImage(sourceUrl:string|undefined,slug:string,revision:string,title:string,summary='',pexelsApiKey?:string,usedImageSources:string[]=[]):Promise<ImagePlan|undefined>{
 const original=imagePlan(sourceUrl,slug,revision,title);if(original)return original;
 const permission=inventory.sources.some(s=>s.id==='panews'&&s.automation_enabled&&s.rights_status==='reviewed'&&s.allowed_reuse==='metadata-discovery'&&(s.review as {permission_status?:string}|undefined)?.permission_status==='owner-confirmed');
 let panewsFeed:string|undefined;
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
   if(image&&!usedImageSources.includes(image)){
    panewsFeed=await fetchPanewsFeed();
    if(panewsFeed&&panewsFeedImageUseCount(panewsFeed,image)<2)return {url:image,alt:title,credit:'PANews',license:'Used with permission',sourceUrl,originalImageUrl:image,kind:'source'};
   }
  }
 }catch{/* An unavailable source image must not block licensed-photo discovery. */}
 if(permission&&sourceUrl&&/^https:\/\/www\.panewslab\.com\/(?:en|zh)\/articles\/[a-f0-9-]{20,64}$/.test(sourceUrl))try{
  panewsFeed=panewsFeed??await fetchPanewsFeed();
  if(panewsFeed){const image=parsePanewsFeedImage(panewsFeed,sourceUrl);if(image&&!usedImageSources.includes(image))return {url:image,alt:title,credit:'PANews',license:'Used with permission',sourceUrl,originalImageUrl:image,kind:'source'};}
 }catch{/* Feed image discovery is optional; licensed public images remain available. */}
 return await pexelsImage(title,summary,pexelsApiKey,usedImageSources)||await commonsImage(title,summary,usedImageSources);
}
async function fetchPanewsFeed():Promise<string|undefined>{
 try{
  const response=await fetch('https://www.panewslab.com/rss.xml?lang=en&type=NORMAL%2CNEWS%2CVIDEO',{headers:{'User-Agent':'TokenOnAirDiscovery/1.0','Accept':'application/rss+xml, application/xml'},redirect:'manual',signal:AbortSignal.timeout(8000)});
  if(response.ok&&/application\/(?:rss\+xml|xml)|text\/xml/i.test(response.headers.get('content-type')||''))return await limitedText(response,1048576);
 }catch{/* Feed lookup failure should not disable Commons/Pexels discovery. */}
}
