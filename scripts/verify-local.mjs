import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {createServer} from 'node:net';
import {setTimeout as delay} from 'node:timers/promises';
const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const base=`http://127.0.0.1:${port}`;
const env={...process.env,APP_ENV:'local',CONTENT_MODE:'fixture',HOST:'127.0.0.1',PORT:String(port),SITE_URL:base,SMOKE_BASE_URL:base,SMOKE_PREVIEW:'1',PREVIEW_ACCESS_KEY:randomBytes(32).toString('hex'),PREVIEW_SIGNING_SECRET:randomBytes(32).toString('hex')};
for(const key of ['VERCEL','VERCEL_ENV','SANITY_READ_TOKEN','SANITY_WRITE_TOKEN','VALIDATION_SECRET','BEEHIIV_API_KEY'])delete env[key];
env.NEWSLETTER_ENABLED='0';
const server=spawn(process.execPath,['scripts/preview.mjs'],{env,stdio:'ignore'});
try{
 let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw new Error('Built server exited');try{await fetch(base+'/en/');ready=true;break;}catch{await delay(100);}}
 if(!ready)throw new Error('Built server did not start');
 for(const script of ['check-foundation.mjs','check-newsroom.mjs','check-launch.mjs','check-newsroom-states.mjs'])await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[`scripts/${script}`],{env,stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`${script} failed`)));});
}finally{server.kill();await new Promise(resolve=>server.once('exit',resolve));}
