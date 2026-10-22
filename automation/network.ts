import {lookup} from 'node:dns/promises';
import {request} from 'node:https';
import {isIP} from 'node:net';
import {gunzipSync,inflateSync,brotliDecompressSync} from 'node:zlib';
export function isPublicIPv4(address:string):boolean{
 if(isIP(address)!==4)return false;const [a,b,c]=address.split('.').map(Number);
 return !(a===0||a===10||a===127||a>=224||(a===100&&b>=64&&b<=127)||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&(b===168||b===0||(b===2)))||(a===198&&(b===18||b===19||(b===51&&c===100)))||(a===203&&b===0&&c===113));
}
export function allowedUrl(value:string,hosts:Set<string>):URL{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port||isIP(url.hostname)||!hosts.has(url.hostname))throw new Error('Destination not allowed');return url;}
export async function safeFetch(value:string,hosts:Set<string>,headers:Record<string,string>={},redirects=0):Promise<{status:number;headers:Record<string,string|undefined>;body:string}>{
 if(redirects>3)throw new Error('Too many redirects');const url=allowedUrl(value,hosts);const addresses=await lookup(url.hostname,{all:true,family:4});
 if(!addresses.length||addresses.some(a=>!isPublicIPv4(a.address)))throw new Error('Unsafe DNS result');
 const address=addresses[0].address;
 const response=await new Promise<{status:number;headers:Record<string,string|undefined>;bytes:Buffer}>((resolve,reject)=>{
  const req=request(url,{method:'GET',family:4,headers:{'User-Agent':'TokenOnAirDiscovery/1.0','Accept-Encoding':'gzip, deflate, br',...headers},lookup:(_host,_opts,cb)=>cb(null,address,4),timeout:10000},res=>{
   let length=0;const chunks:Buffer[]=[];res.on('data',(chunk:Buffer)=>{length+=chunk.length;if(length>2097152){req.destroy(new Error('Response too large'));return;}chunks.push(chunk);});res.on('error',reject);res.on('end',()=>resolve({status:res.statusCode||0,headers:Object.fromEntries(Object.entries(res.headers).map(([k,v])=>[k,Array.isArray(v)?v[0]:v])),bytes:Buffer.concat(chunks)}));
  });req.on('error',reject);req.on('timeout',()=>req.destroy(new Error('Fetch timeout')));req.end();
 });
 if([301,302,303,307,308].includes(response.status)){if(!response.headers.location)throw new Error('Invalid redirect');return safeFetch(new URL(response.headers.location,url).href,hosts,headers,redirects+1);}
 const encoding=response.headers['content-encoding'];let bytes=response.bytes;
 if(encoding==='gzip')bytes=gunzipSync(bytes,{maxOutputLength:2097152});else if(encoding==='deflate')bytes=inflateSync(bytes,{maxOutputLength:2097152});else if(encoding==='br')bytes=brotliDecompressSync(bytes,{maxOutputLength:2097152});else if(encoding&&encoding!=='identity')throw new Error('Unsupported encoding');
 if(bytes.length>2097152)throw new Error('Response too large');return {status:response.status,headers:response.headers,body:bytes.toString('utf8')};
}
