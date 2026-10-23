import {readFileSync} from 'node:fs';import {Collector} from './intake';import {pipeline,type Settings} from './pipeline';import {secret} from './server';import {limitedText} from '../../workers/news/config';import type {FeedItem} from '../feed';
export const sourceInventory=()=>JSON.parse(readFileSync('/app/sources.json','utf8')).sources as Settings['sources'];
export function createRuntime(acceptanceItem?:FeedItem){
 const sources=sourceInventory();const workerUrl='https://token-on-air-news.reallyhat.workers.dev',writerToken=secret('writer_token');
 const collector=new Collector('/data/intake.sqlite',sources,async(batch,signal)=>{
  const r=await fetch(workerUrl+'/v1/ingest',{method:'POST',headers:{authorization:'Bearer '+writerToken,'content-type':'application/json'},body:JSON.stringify(batch),signal,redirect:'error'});
  if(!r.ok)throw Error('Metadata ingest refused');const ack=JSON.parse(await limitedText(r,4096));if(ack.source!==batch.source||ack.accepted!==batch.items.length)throw Error('Metadata ingest identity mismatch');
 });
 return {collector,processRun:pipeline({workerUrl,writerToken,agentUrl:'http://codex:5681',agentToken:secret('agent_token'),validationSecret:secret('validation_secret'),sources,projectId:'4k0o7q9m',dataset:'production',acceptanceItem,context:()=>collector.context(),canAccess:(url,signal)=>collector.canAccess(url,signal),collect:signal=>collector.poll(signal)}),close:()=>collector.close()};
}
