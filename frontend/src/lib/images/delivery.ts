export interface ResponsiveImage {src:string;srcset?:string;sizes?:string}
const isSanityImage=(value:string)=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='cdn.sanity.io'&&/^\/images\/[a-z0-9]+\/[a-z0-9_-]+\//.test(url.pathname);}catch{return false;}};
const isEditorialImage=(value:string)=>{try{const url=new URL(value,'https://tokenonair.com');return url.pathname.startsWith('/api/images/')&&(url.origin==='https://tokenonair.com'||url.hostname==='localhost'||url.hostname==='127.0.0.1');}catch{return false;}};
const relativeOrAbsolute=(original:string,url:URL)=>original.startsWith('http')?url.href:`${url.pathname}${url.search}${url.hash}`;
export function responsiveImage(src:string,maxWidth:number,sizes?:string):ResponsiveImage{
 const width=Math.max(1,Math.round(maxWidth));
 if(isEditorialImage(src)){
  const candidates=width>=700?[480,960,1200]:[320,480,720];
  const variant=(w:number)=>{const url=new URL(src,'https://tokenonair.com');url.searchParams.set('w',String(w));return relativeOrAbsolute(src,url);};
  return {src:variant(width>=700?960:480),srcset:candidates.map(w=>`${variant(w)} ${w}w`).join(', '),sizes:sizes||`(max-width: ${width+40}px) calc(100vw - 40px), ${width}px`};
 }
 if(!isSanityImage(src))return {src};
 const candidates=width>=700?[480,960,1200]:[320,480,720];
 const variant=(w:number)=>{const url=new URL(src);url.searchParams.set('auto','format');url.searchParams.set('fit','max');url.searchParams.set('q','82');url.searchParams.set('w',String(w));return url.href;};
 return {src:variant(width>=700?960:480),srcset:candidates.map(w=>`${variant(w)} ${w}w`).join(', '),sizes:sizes||`(max-width: ${width+40}px) calc(100vw - 40px), ${width}px`};
}
