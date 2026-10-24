import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
export const secret=(name:string)=>readFileSync('/run/secrets/'+name,'utf8').trim();
export function serve(port:number,handle:(r:Request)=>Promise<Response>,close?:()=>void|Promise<void>){
 let stopping=false;
 const server=createServer(async(req,res)=>{
  try{
   if(stopping){res.writeHead(503,{'connection':'close'});res.end();return;}
   const chunks:Buffer[]=[];let size=0;
   for await(const chunk of req){size+=chunk.length;if(size>250000){res.writeHead(413,{'connection':'close'});res.end();return;}chunks.push(chunk);}
   if(stopping){res.writeHead(503,{'connection':'close'});res.end();return;}
   const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
   const response=await handle(new Request('http://service'+req.url,{method:req.method,headers,...(['GET','HEAD'].includes(req.method||'GET')?{}:{body:Buffer.concat(chunks)})}));
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{if(!res.headersSent)res.writeHead(500);res.end('{"error":"Internal operation failed"}');}
 });
 server.requestTimeout=10000;server.headersTimeout=5000;server.keepAliveTimeout=5000;
 server.listen(port,'0.0.0.0',()=>console.log(JSON.stringify({service:'newsroom',listening:port})));
 process.on('SIGTERM',()=>{
  if(stopping)return;stopping=true;
  let cleanup:Promise<void>;try{cleanup=Promise.resolve(close?.());}catch(error){cleanup=Promise.reject(error);}
  const closed=new Promise<void>(resolve=>server.close(()=>resolve()));
  void Promise.all([cleanup,closed]).then(()=>process.exit(0),()=>process.exit(1));
  setTimeout(()=>process.exit(1),250000).unref();
 });
 return server;
}
