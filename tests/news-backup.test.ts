import {it,expect} from 'vitest';import {mkdtempSync,writeFileSync,readFileSync,existsSync,rmSync,statSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {randomBytes} from 'node:crypto';
import {encryptBackup,decryptBackup} from '../scripts/lib/news-backup.mjs';
it('roundtrips authenticated encrypted backups without plaintext or permissive files',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'toa-backup-'));try{const input=join(dir,'input'),enc=join(dir,'encrypted'),out=join(dir,'restored');const key=randomBytes(32);writeFileSync(input,'private credentials and SQLite archive');await encryptBackup(input,enc,key);expect(readFileSync(enc).includes(Buffer.from('private credentials'))).toBe(false);expect(statSync(enc).mode&0o777).toBe(0o600);await decryptBackup(enc,out,key);expect(readFileSync(out,'utf8')).toBe(readFileSync(input,'utf8'));}finally{rmSync(dir,{recursive:true,force:true});}
});
it('rejects wrong keys or tampering and removes incomplete plaintext',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'toa-backup-'));try{const input=join(dir,'input'),enc=join(dir,'encrypted'),out=join(dir,'restored');const key=randomBytes(32);writeFileSync(input,'secret');await encryptBackup(input,enc,key);await expect(decryptBackup(enc,out,randomBytes(32))).rejects.toThrow();expect(existsSync(out)).toBe(false);const bytes=readFileSync(enc);bytes[22]^=1;writeFileSync(enc,bytes);await expect(decryptBackup(enc,out,key)).rejects.toThrow();expect(existsSync(out)).toBe(false);}finally{rmSync(dir,{recursive:true,force:true});}
});
it('never overwrites or deletes a preexisting restore destination',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'toa-backup-'));try{const input=join(dir,'input'),enc=join(dir,'encrypted'),out=join(dir,'restored'),key=randomBytes(32);writeFileSync(input,'secret');writeFileSync(out,'existing data');await encryptBackup(input,enc,key);await expect(decryptBackup(enc,out,key)).rejects.toThrow();expect(readFileSync(out,'utf8')).toBe('existing data');}finally{rmSync(dir,{recursive:true,force:true});}
});
it('rejects an incomplete backup even if its manifest claims all expected databases',async()=>{
 const {assertCompleteSnapshot}=await import('../scripts/lib/news-backup.mjs');
 const dir=mkdtempSync(join(tmpdir(),'toa-incomplete-'));try{writeFileSync(join(dir,'manifest.json'),JSON.stringify({format:1,databases:['n8n.sqlite','runs.sqlite','intake.sqlite'],fingerprints:{}}));writeFileSync(join(dir,'n8n.sqlite'),'present');await expect(assertCompleteSnapshot(dir)).rejects.toThrow('Required database missing');}finally{rmSync(dir,{recursive:true,force:true});}
});
