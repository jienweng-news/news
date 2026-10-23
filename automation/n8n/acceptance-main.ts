// Server operator CLI only. No public endpoint accepts an arbitrary prompt, URL or candidate.
import {writeFileSync} from 'node:fs';import {parseFeed} from '../feed';import {safeFetch} from '../network';import {activeSource,sourceHosts} from '../sources';import {createRuntime,sourceInventory} from './runtime';
const source=sourceInventory().find(s=>s.id===process.argv[2]&&activeSource(s));if(!source)throw Error('Reviewed source ID required');
const r=await safeFetch(source.resolved_url||source.url,sourceHosts(source));if(r.status!==200)throw Error('Feed unavailable');
const item=parseFeed(r.body).find(i=>sourceHosts(source).has(new URL(i.url).hostname)&&(!process.argv[3]||i.url===process.argv[3]));if(!item)throw Error('No matching fresh item in actual source feed');
const runtime=createRuntime(item);
try{
 const result=await runtime.processRun('queue');const artifact='/data/acceptance-'+item.fingerprint+'.json';writeFileSync(artifact,JSON.stringify({checkedAt:new Date().toISOString(),source:source.id,item,result},null,2),{mode:0o600});
 console.log(JSON.stringify({state:result.state,published:false,source:source.id,title:item.title,artifact,reason:(result as any).reason,snapshotUrls:(result as any).snapshotUrls,reviewReason:(result as any).reviewReason,diagnosticStage:(result as any).diagnostics?.stage,verifier:(result as any).diagnostics?.review}));
 if(result.state!=='validated')process.exitCode=1;
}finally{runtime.close();}
