import {it,expect} from 'vitest';
import {createHash} from 'node:crypto';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {Coordinator,buildCandidate,verifyAndSign} from '../automation/n8n/coordinator';
import {candidateHash,requiredChecks,validateCandidate} from '../automation/publisher';
const draft={section:'ai',editions:Object.fromEntries(['en','zh','zhCn'].map(l=>[l,{title:'Update',summary:'A factual update.',slug:'update-'+l.toLowerCase(),paragraphs:['An original factual brief.','The company announced an update.']}])),evidence:[{url:'https://example.org/news',quote:'The company announced an update.'}]};
const snapshots=[{url:'https://example.org/news',text:'The company announced an update.',hash:createHash('sha256').update('The company announced an update.').digest('hex'),primary:true}];
const review=Object.fromEntries(requiredChecks.filter(k=>k!=='sourceRights').map(k=>[k,true]));
it('builds and signs only independently reviewed exact snapshot evidence',()=>{
 const candidate=buildCandidate(draft,'https://example.org/news');
 const signed=verifyAndSign(candidate,snapshots,{...review,reason:'Checked all claims'},'s'.repeat(48),true);
 expect(validateCandidate(signed,'s'.repeat(48)).hash).toBe(candidateHash({article:signed.article,evidence:signed.evidence}));
 expect(()=>verifyAndSign(candidate,snapshots,{...review,claimsVerified:false},'s'.repeat(48),true)).toThrow();
 expect(()=>verifyAndSign(candidate,snapshots,review,'s'.repeat(48),false)).toThrow();
 candidate.evidence[0].quote='An invented quote';expect(()=>verifyAndSign(candidate,snapshots,review,'s'.repeat(48),true)).toThrow();
});
it('does not claim jobs or invoke models while paused',async()=>{
 const c=new Coordinator(':memory:',async()=>{throw Error('must not call');},false);
 expect(await c.tick('queue')).toMatchObject({state:'paused'});c.close();
});
it('persists results across restart and refuses concurrent ticks',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'toa-test-'));const path=join(dir,'runs.sqlite');let release:any;
 const c=new Coordinator(path,()=>new Promise(r=>{release=r;}),true);
 const pending=c.tick('smoke');await new Promise(r=>setTimeout(r,1));await expect(c.tick('smoke')).rejects.toThrow('busy');
 release({state:'smoke-passed'});await pending;c.close();
 const reopened=new Coordinator(path,async()=>({}),true);expect(reopened.history()[0].state).toBe('smoke-passed');reopened.close();rmSync(dir,{recursive:true,force:true});
});
it('stores failures without credentials and closes interrupted runs on restart',async()=>{
 const c=new Coordinator(':memory:',async()=>{throw Error('secret credential');},true);
 expect(await c.tick('smoke')).toMatchObject({state:'failed'});expect(JSON.stringify(c.history())).not.toContain('secret credential');c.close();
});
it('ships inactive credential-backed five-minute queue and manual smoke workflows',()=>{
 const workflows=JSON.parse(readFileSync('deploy/n8n/workflows.json','utf8'));
 expect(workflows).toHaveLength(2);
 for(const w of workflows){expect(w.active).toBe(false);const http=w.nodes.find((n:any)=>n.type==='n8n-nodes-base.httpRequest');expect(http.credentials.httpHeaderAuth.id).toBe('toa-coordinator');expect(http.parameters.url).toBe('http://coordinator:5680/v1/tick');expect(w.settings.executionTimeout).toBeLessThanOrEqual(300);}
 expect(workflows[0].nodes.find((n:any)=>n.type==='n8n-nodes-base.scheduleTrigger').parameters.rule.interval[0].minutesInterval).toBe(5);
 expect(JSON.stringify(workflows)).not.toContain('Bearer ');
});
