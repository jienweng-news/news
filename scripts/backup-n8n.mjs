import {mkdirSync,mkdtempSync,readFileSync,writeFileSync,existsSync,copyFileSync,readdirSync,statSync,rmSync,chmodSync} from 'node:fs';import {resolve,join} from 'node:path';import {randomBytes,createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {DatabaseSync} from 'node:sqlite';import {encryptBackup,decryptBackup,assertCompleteSnapshot,requiredDatabases} from './lib/news-backup.mjs';
process.umask(0o077);const root=resolve(import.meta.dirname,'..'),base=join(root,'.private/n8n/backups');mkdirSync(base,{recursive:true,mode:0o700});
const keyFile=join(root,'.private/n8n/secrets/backup_key');if(!existsSync(keyFile))writeFileSync(keyFile,randomBytes(32),{mode:0o600});const key=readFileSync(keyFile);if(key.length!==32)throw Error('Invalid backup key');
const stage=mkdtempSync(join(base,'stage-'));const stamp=new Date().toISOString().replace(/[:.]/g,'-'),archive=join(stage,'archive.tar.gz'),encrypted=join(base,stamp+'.toa-backup');
try{
 const snapshot=join(stage,'snapshot');mkdirSync(snapshot,{mode:0o700});
 const code=`const fs=require('fs'),{DatabaseSync,backup}=require('node:sqlite');(async()=>{for(const [src,dst]of [['/n8n/database.sqlite','n8n.sqlite'],['/data/runs.sqlite','runs.sqlite'],['/data/intake.sqlite','intake.sqlite']]){if(!fs.existsSync(src))throw Error('Required database missing: '+dst);{const db=new DatabaseSync(src,{readOnly:true});try{await backup(db,'/backup/'+dst);fs.chmodSync('/backup/'+dst,0o600);}finally{db.close();}}}fs.copyFileSync('/n8n/config','/backup/n8n-config');})().catch(()=>process.exit(1));`;
 execFileSync('sudo',['-n','docker','run','--rm','--user',process.getuid()+':'+process.getgid(),'-v','token-on-air-automation_n8n_data:/n8n:ro','-v','token-on-air-automation_coordinator_data:/data:ro','-v',snapshot+':/backup','node:22.23.1-bookworm-slim','node','-e',code],{stdio:['ignore','ignore','pipe'],timeout:120000});
 const credentials=join(snapshot,'private');mkdirSync(credentials,{mode:0o700});
 for(const name of ['n8n_key','agent_token','coordinator_token','writer_token','validation_secret'])copyFileSync(join(root,'.private/n8n/secrets',name),join(credentials,name));
 copyFileSync(join(root,'.private/n8n/auth/auth.json'),join(credentials,'codex-auth.json'));copyFileSync(join(root,'.private/cloudflare/service-credentials.json'),join(credentials,'cloudflare-service.json'));
 const fingerprints=Object.fromEntries(readdirSync(credentials).map(f=>[f,createHash('sha256').update(readFileSync(join(credentials,f))).digest('hex')]));writeFileSync(join(snapshot,'manifest.json'),JSON.stringify({createdAt:new Date().toISOString(),format:1,databases:requiredDatabases,fingerprints},null,2));
 await assertCompleteSnapshot(snapshot);
 execFileSync('tar',['-czf',archive,'-C',snapshot,'.'],{timeout:60000});await encryptBackup(archive,encrypted,key);
 // Restore into an isolated temporary directory, never over production files/volumes.
 const restored=join(stage,'restored');mkdirSync(restored,{mode:0o700});const decoded=join(stage,'decoded.tar.gz');await decryptBackup(encrypted,decoded,key);
 const names=execFileSync('tar',['-tzf',decoded],{encoding:'utf8'}).trim().split('\n');if(names.some(n=>!n.startsWith('./')||n.includes('..')))throw Error('Unexpected archive path');execFileSync('tar',['-xzf',decoded,'-C',restored],{timeout:60000});
 await assertCompleteSnapshot(restored);
 const counts={};for(const [file,table]of [['n8n.sqlite','workflow_entity'],['runs.sqlite','runs'],['intake.sqlite','leads']]){const db=new DatabaseSync(join(restored,file),{readOnly:true});try{if(Object.values(db.prepare('PRAGMA quick_check').get())[0]!=='ok')throw Error('Restored database integrity failed');counts[file]=Number(db.prepare('SELECT count(*) AS n FROM '+table).get().n);}finally{db.close();}}
 const status={ok:true,createdAt:new Date().toISOString(),encryptedFile:encrypted,bytes:statSync(encrypted).size,restoredCounts:counts,credentialsMatched:true,offServer:false};writeFileSync(join(base,'latest.json'),JSON.stringify(status,null,2));console.log(JSON.stringify(status));
 // Retain7local encrypted snapshots; these are this script's generated archives only.
 const previous=readdirSync(base).filter(f=>/^\d{4}-.*\.toa-backup$/.test(f)).sort().reverse();for(const old of previous.slice(7))rmSync(join(base,old));
}finally{if(stage.startsWith(base+'/stage-'))rmSync(stage,{recursive:true,force:true});}
