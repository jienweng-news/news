import type {BodyBlock} from './content/types';

// Only the pipeline's explicit licensing credit is separated; editorial prose stays intact.
export function presentArticleBody(blocks:BodyBlock[]) {
 const body:BodyBlock[]=[],credits:BodyBlock[]=[];
 for(const block of blocks){
  const text=block.children.map(c=>c.text).join('');
  if(!text.startsWith('Source: ')||!text.includes('original authors credited at ')||!text.includes('CC BY 4.0')||!text.endsWith('No endorsement.')){body.push(block);continue;}
  const children:BodyBlock['children']=[],markDefs:BodyBlock['markDefs']=[];
  let cursor=0;
  for(const match of text.matchAll(/https:\/\/[^\s)]+/g)){
   const start=match.index!,href=match[0].replace(/[.,;]+$/,'');
   if(start>cursor)children.push({_type:'span',_key:`text-${cursor}`,text:text.slice(cursor,start),marks:[]});
   const key=`credit-link-${start}`;
   markDefs.push({_type:'link',_key:key,href});
   children.push({_type:'span',_key:key,text:href,marks:[key]});cursor=start+href.length;
  }
  if(cursor<text.length)children.push({_type:'span',_key:'tail',text:text.slice(cursor),marks:[]});
  credits.push({...block,children,markDefs});
 }
 return {body,credits};
}
export function sourceLabel(source:string){
 const url=new URL(source),last=url.pathname.split('/').filter(Boolean).at(-1);
 if(!last||/^\d+$/.test(last))return url.hostname;
 let label:string;
 try{label=decodeURIComponent(last);}catch{return url.hostname;}
 label=label.replace(/\.(html?|xml)$/i,'').replace(/[-_]+/g,' ');
 return label.charAt(0).toUpperCase()+label.slice(1);
}
