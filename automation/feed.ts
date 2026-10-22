import {XMLParser,XMLValidator} from 'fast-xml-parser';
import {createHash} from 'node:crypto';
export interface FeedItem{title:string;url:string;publishedAt:string;fingerprint:string}
export function canonicalItemUrl(value:string):string{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port||!url.hostname.includes('.'))throw new Error('Unsafe item URL');url.hash='';for(const key of [...url.searchParams.keys()])if(/^utm_|^(fbclid|gclid)$/.test(key))url.searchParams.delete(key);return url.href;}
// Require an explicit zone and calendar-valid date; never treat an update as first publication.
export function feedPublicationTime(value:string):number{
 const iso=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
 const rfc=/^(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*)?(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{2}):(\d{2})(?::(\d{2}))? (GMT|UT|[+-]\d{4})$/.exec(value);
 if(!iso&&!rfc)return NaN;
 const [year,month,day,hour,minute,second]=iso?iso.slice(1,7).map(Number):[Number(rfc![3]),'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ').indexOf(rfc![2])+1,Number(rfc![1]),...rfc!.slice(4,7).map(v=>Number(v||0))];
 const days=new Date(Date.UTC(year,month,0)).getUTCDate();
 if(month<1||month>12||day<1||day>days||hour>23||minute>59||second>59)return NaN;
 const zone=iso?.[7]||rfc![7];const offset=/^[+-](\d{2}):?(\d{2})$/.exec(zone);
 if(offset&&(Number(offset[1])>23||Number(offset[2])>59))return NaN;
 return Date.parse(value);
}
const string=(value:any):string=>typeof value==='string'?value:typeof value==='number'?String(value):typeof value?.['#text']==='string'?value['#text']:'';
export function parseFeed(xml:string,now=Date.now()):FeedItem[]{
 if(Buffer.byteLength(xml)>2097152||/<!\s*(DOCTYPE|ENTITY)/i.test(xml)||XMLValidator.validate(xml)!==true)throw new Error('Invalid feed');
 const parsed=new XMLParser({ignoreAttributes:false,processEntities:false,parseTagValue:false,isArray:name=>['item','entry','link'].includes(name)}).parse(xml);
 const items=parsed.rss?.channel?.item||parsed.feed?.entry;if(!Array.isArray(items)||items.length>3000)throw new Error('Unsupported feed');
 const found:FeedItem[]=[];
 for(const item of items){try{
  const title=string(item.title).replace(/<[^>]*>/g,'').trim().slice(0,500);const links=Array.isArray(item.link)?item.link:[item.link];
  const link=links.find((l:any)=>l?.['@_rel']==='alternate')||links.find((l:any)=>typeof l==='string'||l?.['@_href']);
  const url=canonicalItemUrl(typeof link==='object'?link['@_href']:string(link));const time=feedPublicationTime(string(item.pubDate||item.published));
  if(!title||!Number.isFinite(time)||time<now-48*3600000||time>now+300000)continue;
  found.push({title,url,publishedAt:new Date(time).toISOString(),fingerprint:createHash('sha256').update(url).digest('hex')});
 }catch{continue;}}
 return [...new Map(found.map(i=>[i.fingerprint,i])).values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}
