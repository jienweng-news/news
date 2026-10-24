import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
export const secret=(name:string)=>readFileSync('/run/secrets/'+name,'utf8').trim();
export function serve(port:number,handle:(r:Request)=>Promise<Response>,close?:()=>void|Promise<void>){
 const server=createServer(async(req,res)=>{
  try{
   const chunks:Buffer[]=[];let size=0;
   for await(const chunk of req){size+=chunk.length;if(size>250000){res.writeHead(413,{'connection':'close'});res.end();return;}chunks.push(chunk);}
   const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
   const response=await handle(new Request('http://service'+req.url,{method:req.method,headers,...(['GET','HEAD'].includes(req.method||'GET')?{}:{body:Buffer.concat(chunks)})}));
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{if(!res.headersSent)res.writeHead(500);res.end('{"error":"Internal operation failed"}');}
 });
 server.requestTimeout=10000;server.headersTimeout=5000;server.keepAliveTimeout=5000;
 server.listen(port,'0.0.0.0',()=>console.log(JSON.stringify({service:'newsroom',listening:port})));
 process.on('SIGTERM',()=>{server.close(()=>{void Promise.resolve().then(()=>close?.()).then(()=>process.exit(0),()=>process.exit(1));});setTimeout(()=>process.exit(1),250000).unref();});
 return server;
}
