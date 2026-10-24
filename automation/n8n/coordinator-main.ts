import {createRuntime} from './runtime';
import {Coordinator} from './coordinator';import {serve,secret} from './server';
import {ContinuousQueue} from './continuous';import {coordinatorHandler} from './coordinator-http';
const enabled=process.env.NEWSROOM_ENABLED==='1';
const runtime=createRuntime();
const c=new Coordinator('/data/runs.sqlite',runtime.processRun,enabled);
const continuous=new ContinuousQueue(()=>c.tick('queue'),enabled);
serve(5680,coordinatorHandler(c,continuous,runtime.collector,secret('coordinator_token'),enabled),async()=>{
 await continuous.stop();c.close();runtime.close();
});
