import {expect,it} from 'vitest';
import {spawn} from 'node:child_process';
it('waits for asynchronous service cleanup before exiting on SIGTERM',async()=>{
 const source=new URL('../automation/n8n/server.ts',import.meta.url).href;
 const child=spawn(process.execPath,['--experimental-strip-types','--input-type=module','-e',`import {serve} from ${JSON.stringify(source)};serve(0,async()=>Response.json({ok:true}),async()=>{await new Promise(r=>setTimeout(r,30));console.log('cleanup-finished');});`],{stdio:['ignore','pipe','pipe']});
 let output='',stderr='',sent=false;child.stdout.on('data',chunk=>{output+=chunk;if(!sent&&output.includes('listening')){sent=true;child.kill('SIGTERM');}});child.stderr.on('data',chunk=>{stderr+=chunk;});
 const code=await new Promise<number|null>((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});
 expect(code,stderr).toBe(0);expect(output).toContain('cleanup-finished');
});
