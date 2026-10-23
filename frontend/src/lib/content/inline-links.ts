import type {BodyBlock} from './types';
export function citationBlock(text:string,key:string,allowedUrls:string[]):BodyBlock{
 const allowed=new Set(allowedUrls.filter(value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port;}catch{return false;}}));
 const children:BodyBlock['children']=[],markDefs:BodyBlock['markDefs']=[];let cursor=0;
 const add=(value:string,href?:string)=>{if(!value)return;const spanKey=key+'-s'+children.length;if(href){const mark=key+'-link'+markDefs.length;markDefs.push({_type:'link',_key:mark,href});children.push({_type:'span',_key:spanKey,text:value,marks:[mark]});}else children.push({_type:'span',_key:spanKey,text:value,marks:[]});};
 for(const match of text.matchAll(/\[([^\]\n]{1,200})\]\((https:\/\/[^\s)]+)\)|https:\/\/[^\s<>"\]]+/g)){
  const href=(match[2]||match[0]).replace(/[.,;:!?。，；！？)]+$/u,'');if(!allowed.has(href))continue;
  add(text.slice(cursor,match.index));add(match[1]||href,href);cursor=match.index!+(match[1]?match[0].length:href.length);
 }
 add(text.slice(cursor));if(!children.length)add(' ');
 return {_type:'block',_key:key,style:'normal',children,markDefs};
}
