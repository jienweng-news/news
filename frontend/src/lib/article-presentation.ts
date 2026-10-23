import {citationBlock} from './content/inline-links';
import type {BodyBlock} from './content/types';

export function publicArticleSources(sources:string[]){return sources.filter(source=>!['www.panewslab.com','panews.io','www.panews.io'].includes(new URL(source).hostname));}

// Only the pipeline's explicit licensing credit is separated; editorial prose stays intact.
export function presentArticleBody(blocks:BodyBlock[],sources:string[]=[]) {
 sources=publicArticleSources(sources);
 const body:BodyBlock[]=[],credits:BodyBlock[]=[];const mentioned=new Set<string>();
 const names:Record<string,string[]>={'research.google':['Google Research','Google 研究','Google研究'],'deepmind.google':['Google DeepMind','DeepMind','Google'],'blog.ethereum.org':['Ethereum Foundation','以太坊基金會','以太坊基金会'],'www.panewslab.com':['PANews']};
 const withLinks=(block:BodyBlock)=>{
  const hidden=new Set(block.markDefs.filter(m=>m._type==='link'&&typeof m.href==='string'&&publicArticleSources([m.href]).length===0).map(m=>m._key));
  if(hidden.size)block={...block,markDefs:block.markDefs.filter(m=>!hidden.has(m._key)),children:block.children.map(c=>({...c,marks:c.marks.filter(m=>!hidden.has(m))}))};
  if(!sources.length||block.markDefs.length||block.children.some(c=>c.marks.length))return block;
  const text=block.children.map(c=>c.text).join('');let linked=citationBlock(text,block._key,sources);
  for(const href of sources){if(mentioned.has(href))continue;const labels=names[new URL(href).hostname]||[];const label=labels.find(n=>text.includes(n));if(!label||linked.markDefs.length)continue;const start=text.indexOf(label),key=block._key+'-source';
   linked={...linked,children:[{_type:'span' as const,_key:key+'-before',text:text.slice(0,start),marks:[]},{_type:'span' as const,_key:key,text:label,marks:[key]},{_type:'span' as const,_key:key+'-after',text:text.slice(start+label.length),marks:[]}].filter(c=>c.text),markDefs:[{_type:'link',_key:key,href}]};mentioned.add(href);
  }
  return {...block,children:linked.children,markDefs:linked.markDefs};
 };
 for(const block of blocks){
  const text=block.children.map(c=>c.text).join('');
  if(!text.startsWith('Source: ')||!text.includes('original authors credited at ')||!text.includes('CC BY 4.0')||!text.endsWith('No endorsement.')){body.push(withLinks(block));continue;}
  const children:BodyBlock['children']=[],markDefs:BodyBlock['markDefs']=[];
  let cursor=0;
  for(const match of text.matchAll(/https:\/\/[^\s)]+/g)){
   const start=match.index!,href=match[0].replace(/[.,;]+$/,'');
   if(start>cursor)children.push({_type:'span' as const,_key:`text-${cursor}`,text:text.slice(cursor,start),marks:[]});
   const key=`credit-link-${start}`;
   markDefs.push({_type:'link',_key:key,href});
   children.push({_type:'span' as const,_key:key,text:href,marks:[key]});cursor=start+href.length;
  }
  if(cursor<text.length)children.push({_type:'span' as const,_key:'tail',text:text.slice(cursor),marks:[]});
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
