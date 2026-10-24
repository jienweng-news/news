export interface SourceImagePlan{url:string;alt:string;credit:string;license:string;sourceUrl:string;originalImageUrl?:string;licenseUrl?:string;provider?:'pexels'|'commons';kind:'source'}
export interface GeneratedImagePlan{svg:string;alt:string;credit:'Token on Air · Editorial illustration';license:'© Token on Air';kind:'generated'}
export type ImagePlan=SourceImagePlan|GeneratedImagePlan;
// Media reuse is reviewed per asset. RSS/OG availability alone is not permission.
export const imageVersion='source-first-v8-topic-relevance';
export const editorialImageRevision='codex-local-illustration-v1';
const svgAttributes:Record<string,RegExp>={
 xmlns:/^http:\/\/www\.w3\.org\/2000\/svg$/,viewBox:/^0 0 1200 630$/,width:/^1200$/,height:/^630$/,
 x:/^-?\d+(?:\.\d+)?$/,y:/^-?\d+(?:\.\d+)?$/,width2:/^\d+(?:\.\d+)?%?$/,height2:/^\d+(?:\.\d+)?%?$/,
 cx:/^-?\d+(?:\.\d+)?$/,cy:/^-?\d+(?:\.\d+)?$/,r:/^\d+(?:\.\d+)?$/,rx:/^\d+(?:\.\d+)?$/,ry:/^\d+(?:\.\d+)?$/,
 d:/^[MmLlHhVvCcSsQqTtAaZz0-9.,+\-\s]+$/,points:/^[0-9.,+\-\s]+$/,fill:/^(?:#[\da-fA-F]{3,8}|none|transparent)$/,stroke:/^(?:#[\da-fA-F]{3,8}|none|transparent)$/,
 'stroke-width':/^\d+(?:\.\d+)?$/,'stroke-linecap':/^(?:butt|round|square)$/,'stroke-linejoin':/^(?:miter|round|bevel)$/,'fill-rule':/^(?:nonzero|evenodd)$/,
 opacity:/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/,transform:/^(?:(?:translate|scale|rotate)\([0-9.,+\-\s]+\)\s*)+$/
};
const safeElementNames=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon']);
export function sanitizeEditorialSvg(input:unknown):string|undefined{
 if(typeof input!=='string'||input.length<80||new TextEncoder().encode(input).length>8192||/<!|<\?|&|url\s*\(|href\s*=|style\s*=|on[a-z]+\s*=/i.test(input))return;
 const tokens=[...input.matchAll(/<\/?[A-Za-z][^>]*>/g)];if(tokens.length<4||tokens.length>220)return;
 let cursor=0;const stack:string[]=[];let roots=0;
 for(const match of tokens){if(input.slice(cursor,match.index).trim())return;cursor=(match.index||0)+match[0].length;
  const token=match[0],closing=/^<\//.test(token),selfClosing=/\/>$/.test(token),tagMatch=/^<\/?([a-z]+)\b/.exec(token);if(!tagMatch)return;
  const tag=tagMatch[1];if(!safeElementNames.has(tag)||tag==='svg'&&!closing&&++roots>1||!closing&&!stack.length&&tag!=='svg')return;
  if(closing){if(!/^<\/[a-z]+\s*>$/.test(token)||stack.pop()!==tag)return;continue;}
  const rest=token.slice(tagMatch[0].length,token.length-(selfClosing?2:1));let attrCursor=0;const seenAttributes=new Set<string>(),attrPattern=/\s+([A-Za-z-]+)="([^"]*)"/gy;
  while(attrCursor<rest.length){attrPattern.lastIndex=attrCursor;const attr=attrPattern.exec(rest);if(!attr)return;attrCursor=attrPattern.lastIndex;
   let key=attr[1];if(seenAttributes.has(key))return;seenAttributes.add(key);if(key==='width'&&tag!=='svg')key='width2';if(key==='height'&&tag!=='svg')key='height2';const rule=svgAttributes[key];if(!rule||!rule.test(attr[2]))return;
  }
  if(tag==='svg'&&(!/\bxmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(rest)||!/\bviewBox="0 0 1200 630"/.test(rest)||!/\bwidth="1200"/.test(rest)||!/\bheight="630"/.test(rest)))return;
  if(!selfClosing)stack.push(tag);
 }
 return !input.slice(cursor).trim()&&!stack.length&&roots===1?input:undefined;
}
export const rejectedImageSources=[
 'https://commons.wikimedia.org/wiki/File:Artificial_Intelligence_%26_AI_%26_Machine_Learning.jpg',
 'https://commons.wikimedia.org/wiki/File:Artificial_Intelligence,_AI.jpg',
 'https://commons.wikimedia.org/wiki/File:STOCK_MARKET_(4522934717).jpg',
 'https://commons.wikimedia.org/wiki/File:Crypto_Winter-_The_Crypto_Winter_of_2022.jpg',
 'https://commons.wikimedia.org/wiki/File:Crypto_Winter_-_Frozen_Cryptocurrencies.jpg',
 'https://commons.wikimedia.org/wiki/File:NASDAQ_stock_market_display.jpg',
 'https://commons.wikimedia.org/wiki/File:Rack_for_FPGA_BiXBiT.jpg',
 'https://commons.wikimedia.org/wiki/File:Cryptocurrency_Regulation_%26_Laws.jpg',
 'https://commons.wikimedia.org/wiki/File:IBMPortableModularDataCenter3.jpg',
 'https://commons.wikimedia.org/wiki/File:Internet_Archive_Googly_Eyes_03.jpg',
 'https://commons.wikimedia.org/wiki/File:Market_centre_in_Tokyo_stock_exchange.jpg',
 'https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay',
] as const;
export function imagePlan(sourceUrl:string|undefined,_slug:string,_revision:string,title:string):ImagePlan|undefined{
 void sourceUrl;
 void title;
 return undefined;
}
