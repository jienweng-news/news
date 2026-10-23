export interface ResponsiveImage {src:string;srcset?:string;sizes?:string}
const isSanityImage=(value:string)=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='cdn.sanity.io'&&/^\/images\/[a-z0-9]+\/[a-z0-9_-]+\//.test(url.pathname);}catch{return false;}};
export function responsiveImage(src:string,maxWidth:number,sizes?:string):ResponsiveImage{
 if(!isSanityImage(src))return {src};
 const width=Math.max(1,Math.round(maxWidth));
 const candidates=width>=700?[480,960,1280]:[320,480,720];
 const variant=(w:number)=>{const url=new URL(src);url.searchParams.set('auto','format');url.searchParams.set('fit','max');url.searchParams.set('q','82');url.searchParams.set('w',String(w));return url.href;};
 return {src:variant(width>=700?960:480),srcset:candidates.map(w=>`${variant(w)} ${w}w`).join(', '),sizes:sizes||`(max-width: ${width+40}px) calc(100vw - 40px), ${width}px`};
}
