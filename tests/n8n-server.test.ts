import {expect,it} from 'vitest';
import {spawn} from 'node:child_process';
it('waits for asynchronous service cleanup before exiting on SIGTERM',async()=>{
 const source=new URL('../automation/n8n/server.ts',import.meta.url).href;
 const child=spawn(process.execPath,['--experimental-strip-types','--input-type=module','-e',`import {serve} from ${JSON.stringify(source)};serve(0,async()=>Response.json({ok:true}),async()=>{await new Promise(r=>setTimeout(r,30));console.log('cleanup-finished');});`],{stdio:['ignore','pipe','pipe']});
 let output='',stderr='',sent=false;child.stdout.on('data',chunk=>{output+=chunk;if(!sent&&output.includes('listening')){sent=true;child.kill('SIGTERM');}});child.stderr.on('data',chunk=>{stderr+=chunk;});
 const code=await new Promise<number|null>((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});
 expect(code,stderr).toBe(0);expect(output).toContain('cleanup-finished');
});
it('begins stopping the drain on SIGTERM while an unfinished HTTP request remains open',async()=>{
 const {createConnection}=await import('node:net');
 const source=new URL('../automation/n8n/server.ts',import.meta.url).href;
 const script=`import {serve} from ${JSON.stringify(source)};
 let stopping=false,finish;
 const work=(async()=>{console.log('processor-1');await new Promise(r=>finish=r);if(!stopping)console.log('processor-2');process.send({kind:'work-finished'});})();
 const server=serve(0,async()=>Response.json({ok:true}),async()=>{stopping=true;await work;console.log('cleanup-finished');});
 server.on('listening',()=>process.send({kind:'listening',port:server.address().port}));
 server.on('request',()=>process.send({kind:'request-open'}));
 process.on('SIGTERM',()=>process.send({kind:'signal-seen'}));
 process.on('message',message=>{if(message==='finish')finish();});`;
 const child=spawn(process.execPath,['--experimental-strip-types','--input-type=module','-e',script],{stdio:['ignore','pipe','pipe','ipc']});
 let output='',stderr='',socket:ReturnType<typeof createConnection>|undefined;
 child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);
 child.on('message',(message:any)=>{
  if(message.kind==='listening'){socket=createConnection({host:'127.0.0.1',port:message.port},()=>socket!.write('POST / HTTP/1.1\r\nHost: local\r\nContent-Length: 100\r\n\r\n{'));socket.on('error',()=>{});}
  if(message.kind==='request-open')child.kill('SIGTERM');
  if(message.kind==='signal-seen')child.send('finish');
  if(message.kind==='work-finished')socket?.destroy();
 });
 try{
  const code=await new Promise<number|null>((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});
  expect(code,stderr).toBe(0);expect(output).toContain('cleanup-finished');expect(output).not.toContain('processor-2');
 }finally{socket?.destroy();if(child.exitCode===null)child.kill('SIGKILL');}
});
