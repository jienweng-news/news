// Private server-operator CLI. Never accepts arbitrary candidate JSON or secrets on argv.
import {Coordinator} from './coordinator';import {createRuntime} from './runtime';
if(process.argv[2]==='once'&&process.env.NEWSROOM_ENABLED==='1')throw Error('Pause the coordinator before standalone publication; use the n8n workflow while active');
const runtime=createRuntime();
try{
 if(process.argv[2]==='collect')console.log(JSON.stringify(await runtime.collector.poll(AbortSignal.timeout(90000))));
 else if(process.argv[2]==='once'){
  const c=new Coordinator('/data/runs.sqlite',runtime.processRun,true);try{const result=await c.tick('queue');console.log(JSON.stringify(result));if(!['published','idle','held'].includes(result.state))process.exitCode=1;}finally{c.close();}
 }else throw Error('Use collect or once');
}finally{runtime.close();}
