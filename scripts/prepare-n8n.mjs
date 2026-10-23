import {mkdirSync,readFileSync,writeFileSync,existsSync,copyFileSync,chmodSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';import {homedir} from 'node:os';import {randomBytes} from 'node:crypto';import {execFileSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..'),dir=join(root,'.private/n8n');
for(const sub of ['','context','secrets','auth','import'])mkdirSync(join(dir,sub),{recursive:true,mode:0o700});
const credentials=JSON.parse(readFileSync(join(root,'.private/cloudflare/service-credentials.json'),'utf8'));
for(const name of ['n8n_key','agent_token','coordinator_token','validation_secret','writer_token']){
 const path=join(dir,'secrets',name);if(!existsSync(path))writeFileSync(path,name==='writer_token'?credentials.WRITER_TOKEN:randomBytes(32).toString('hex'),{mode:0o600});chmodSync(path,0o600);
}
if(!existsSync(join(dir,'auth/auth.json')))copyFileSync(join(homedir(),'.codex/auth.json'),join(dir,'auth/auth.json'));
chmodSync(join(dir,'auth/auth.json'),0o600);
// Standalone binary matches this host's CPU architecture. No credentials enter the Docker build context.
copyFileSync(realpathSync(join(homedir(),'.local/bin/codex')),join(dir,'context/codex'));
for(const file of ['Agent.Dockerfile','Coordinator.Dockerfile'])copyFileSync(join(root,'deploy/n8n',file),join(dir,'context',file));
copyFileSync(join(root,'docs/research/source-checks/2026-10-22-fixed-sources.json'),join(dir,'context/sources.json'));
execFileSync(join(root,'node_modules/.bin/esbuild'),['automation/n8n/agent-main.ts','automation/n8n/coordinator-main.ts','automation/n8n/acceptance-main.ts','automation/n8n/operate-main.ts','--bundle','--platform=node','--format=esm','--outdir='+join(dir,'context')],{cwd:root,stdio:'inherit'});
copyFileSync(join(root,'deploy/n8n/workflows.json'),join(dir,'import/workflows.json'));
writeFileSync(join(dir,'import/credentials.json'),JSON.stringify([{id:'toa-coordinator',name:'Private newsroom coordinator',type:'httpHeaderAuth',data:{name:'Authorization',value:'Bearer '+readFileSync(join(dir,'secrets/coordinator_token'),'utf8').trim()}}]),{mode:0o600});
writeFileSync(join(dir,'compose.env'),'NEWSROOM_PRIVATE_DIR='+dir+'\nNEWSROOM_UID='+process.getuid()+'\nNEWSROOM_GID='+process.getgid()+'\n',{mode:0o600});
console.log('Prepared private n8n files. No secret values printed. Compose env: .private/n8n/compose.env');
