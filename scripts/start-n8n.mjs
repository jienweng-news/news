import {execFileSync} from 'node:child_process';import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const run=(args,options={})=>execFileSync('sudo',['-n','docker',...args],{cwd:root,stdio:'inherit',...options});
const compose=['compose','--env-file','.private/n8n/compose.env','-f','deploy/n8n/compose.yaml'];
execFileSync(process.execPath,['scripts/prepare-n8n.mjs'],{cwd:root,stdio:'inherit'});
run([...compose,'build']);run([...compose,'create']);
// Initialize only this project's new dedicated volumes, after image copy-up. Never touch another project's volumes.
run(['run','--rm','--user','root','-v','token-on-air-automation_n8n_data:/n8n','-v','token-on-air-automation_coordinator_data:/data','node:22.23.1-bookworm-slim','node','-e',`const fs=require('fs');for(const p of ['/n8n','/data']){fs.writeFileSync(p+'/.initialized','');fs.chownSync(p,${process.getuid()},${process.getgid()});}`]);
run([...compose,'up','-d']);
console.log('Editor is private at http://localhost:5678. Import workflows once after startup; see docs/operations/n8n.md.');
