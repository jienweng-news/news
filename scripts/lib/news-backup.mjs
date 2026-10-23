import {join} from 'node:path';import {createHash} from 'node:crypto';
import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';import {createReadStream,createWriteStream} from 'node:fs';import {writeFile,appendFile,readFile,stat,unlink,open} from 'node:fs/promises';import {pipeline} from 'node:stream/promises';
const MAGIC=Buffer.from('TOABAK01');
const checkKey=key=>{if(!Buffer.isBuffer(key)||key.length!==32)throw Error('A random32byte backup key is required');};
export async function encryptBackup(input,output,key){
 checkKey(key);const iv=randomBytes(12);await writeFile(output,Buffer.concat([MAGIC,iv]),{flag:'wx',mode:0o600});
 try{const cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(MAGIC);await pipeline(createReadStream(input),cipher,createWriteStream(output,{flags:'a'}));await appendFile(output,cipher.getAuthTag());}
 catch(e){await unlink(output).catch(()=>{});throw e;}
}
export async function decryptBackup(input,output,key){
 checkKey(key);const size=(await stat(input)).size;if(size<36)throw Error('Invalid backup envelope');
 const fh=await open(input,'r');const header=Buffer.alloc(20),tag=Buffer.alloc(16);try{await fh.read(header,0,20,0);await fh.read(tag,0,16,size-16);}finally{await fh.close();}
 if(!header.subarray(0,8).equals(MAGIC))throw Error('Invalid backup format');await writeFile(output,'',{flag:'wx',mode:0o600});
 try{const decipher=createDecipheriv('aes-256-gcm',key,header.subarray(8));decipher.setAAD(MAGIC);decipher.setAuthTag(tag);await pipeline(createReadStream(input,{start:20,end:size-17}),decipher,createWriteStream(output,{flags:'a'}));}
 catch{await unlink(output).catch(()=>{});throw Error('Backup authentication failed');}
}

export const requiredDatabases=['n8n.sqlite','runs.sqlite','intake.sqlite'];
export const requiredCredentials=['n8n_key','agent_token','coordinator_token','writer_token','validation_secret','codex-auth.json','cloudflare-service.json'];
export async function assertCompleteSnapshot(directory){
 for(const file of requiredDatabases)if(!(await stat(join(directory,file)).catch(()=>null))?.isFile())throw Error('Required database missing: '+file);
 const manifest=JSON.parse(await readFile(join(directory,'manifest.json'),'utf8'));
 if(manifest.format!==1||!Array.isArray(manifest.databases)||manifest.databases.length!==requiredDatabases.length||requiredDatabases.some(f=>!manifest.databases.includes(f)))throw Error('Required database manifest entries missing');
 if(!(await stat(join(directory,'n8n-config')).catch(()=>null))?.isFile())throw Error('Required n8n configuration missing');
 if(!manifest.fingerprints||Object.keys(manifest.fingerprints).length!==requiredCredentials.length)throw Error('Required credential manifest entries missing');
 for(const file of requiredCredentials){const expected=manifest.fingerprints[file];if(typeof expected!=='string'||!/^[a-f0-9]{64}$/.test(expected))throw Error('Required credential manifest entry missing: '+file);const data=await readFile(join(directory,'private',file));if(createHash('sha256').update(data).digest('hex')!==expected)throw Error('Restored credential mismatch: '+file);}
}
