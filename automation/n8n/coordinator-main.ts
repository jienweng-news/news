import {readFileSync} from 'node:fs';
import {Coordinator} from './coordinator';import {pipeline} from './pipeline';import {serve,secret} from './server';
import {authorize,json,limitedText,Refused} from '../../workers/news/config';
const enabled=process.env.NEWSROOM_ENABLED==='1';
const c=new Coordinator('/data/runs.sqlite',pipeline({workerUrl:'https://token-on-air-news.reallyhat.workers.dev',writerToken:secret('writer_token'),agentUrl:'http://codex:5681',agentToken:secret('agent_token'),validationSecret:secret('validation_secret'),sources:JSON.parse(readFileSync('/app/sources.json','utf8')).sources,projectId:'4k0o7q9m',dataset:'production'}),enabled);
serve(5680,async request=>{
 try{
  const path=new URL(request.url).pathname;
  if(path==='/health'&&request.method==='GET')return json({service:'token-on-air-coordinator',ok:true,enabled});
  authorize(request,secret('coordinator_token'));if(request.headers.has('origin'))throw new Refused(403,'Browser requests refused');
  if(path==='/v1/history'&&request.method==='GET')return json({runs:c.history()});
  if(path!=='/v1/tick'||request.method!=='POST')return json({error:'Not found'},404);
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Refused(415,'JSON required');
  let body;try{body=JSON.parse(await limitedText(request,1024));}catch(e){if(e instanceof Refused)throw e;throw new Refused(400,'Invalid JSON');}
  if(!body||Object.keys(body).some(k=>k!=='mode'))throw new Refused(400,'Only mode accepted');
  const result=await c.tick(body.mode);return json(result,result.state==='failed'?502:200);
 }catch(e){return json({error:e instanceof Refused?e.label:'Processing failed'},e instanceof Refused?e.status:502);}
},()=>c.close());
