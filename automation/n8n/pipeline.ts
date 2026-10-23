import {createHash} from 'node:crypto';
import {safeFetch} from '../network';
import {activeSource,sourceHosts,type Source} from '../sources';
import {buildCandidate,verifyAndSign,type Snapshot} from './coordinator';
import {limitedText} from '../../workers/news/config';
type Policy=Source&{classification:string};
interface Settings{workerUrl:string;writerToken:string;agentUrl:string;agentToken:string;validationSecret:string;sources:Policy[];projectId:string;dataset:string}
// These functions fetch only the fixed source registry's public HTTPS hosts, with DNS pinning and checked redirects.
export function plainText(html:string){return html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim().slice(0,60000);}
export function pipeline(config:Settings){
 const primaryHosts=new Set(config.sources.filter(s=>s.classification==='ai-primary'||s.classification==='crypto-primary').flatMap(s=>[...sourceHosts(s)]));
 async function agent(task:string,input:any,signal:AbortSignal){
  const res=await fetch(config.agentUrl+'/v1/task',{method:'POST',headers:{authorization:'Bearer '+config.agentToken,'content-type':'application/json'},body:JSON.stringify({task,input}),signal,redirect:'error'});
  if(!res.ok)throw Error('Agent unavailable');return JSON.parse(await limitedText(res,200000));
 }
 async function worker(path:string,body:any,signal:AbortSignal){
  const res=await fetch(config.workerUrl+path,{method:'POST',headers:{authorization:'Bearer '+config.writerToken,'content-type':'application/json'},body:JSON.stringify(body),signal,redirect:'error'});
  if(!res.ok)throw Error('Worker refused');return JSON.parse(await limitedText(res,65536));
 }
 return async(mode:'smoke'|'queue')=>{
  const signal=AbortSignal.timeout(230000);
  if(mode==='smoke'){
   const written=await agent('smoke',{},signal);
   const verified=await agent('review',{candidate:written,snapshots:[],testInstruction:'Synthetic connectivity test only. No evidence supplied: claimsVerified and primaryEvidence MUST be false.'},signal);
   if(written.status!=='ok'||verified.claimsVerified!==false||verified.primaryEvidence!==false)throw Error('Fail-closed smoke refused');
   return {state:'smoke-passed',editions:written,verifierRefusedUnsupportedClaims:true,published:false};
  }
  if(!config.validationSecret||!config.sources.some(activeSource))return {state:'paused',reason:'Reviewed sources and verifier configuration required'};
  const job=await worker('/v1/jobs/claim',{},signal);if(!job.jobId)return {state:'idle'};
  const source=config.sources.find(s=>sourceHosts(s).has(new URL(job.item.url).hostname)&&activeSource(s));
  if(!source||job.leaseUntil-Date.now()<270000)return {state:'held',jobId:job.jobId,reason:'Source policy mismatch or insufficient lease; inspect worker before release'};
  const original=await safeFetch(job.item.url,sourceHosts(source));if(original.status!==200)throw Error('Discovery unavailable');
  const discoveryText=plainText(original.body);const snapshots:Snapshot[]=[{url:job.item.url,text:discoveryText,hash:createHash('sha256').update(discoveryText).digest('hex'),primary:primaryHosts.has(new URL(job.item.url).hostname)}];
  if(!snapshots[0].primary){
   const research=await agent('research',{item:job.item,text:original.body.slice(0,100000),primaryHosts:[...primaryHosts]},signal);
   if(!Array.isArray(research.primaryUrls)||research.primaryUrls.length>3)throw Error('Invalid research');
   for(const url of [...new Set<string>(research.primaryUrls)]){
    if(!original.body.includes(url)||!primaryHosts.has(new URL(url).hostname))throw Error('Unproven primary URL');
    const fetched=await safeFetch(url,primaryHosts);if(fetched.status!==200)throw Error('Primary evidence unavailable');const text=plainText(fetched.body);
    snapshots.push({url,text,hash:createHash('sha256').update(text).digest('hex'),primary:true});
   }
  }
  if(!snapshots.some(s=>s.primary))return {state:'held',jobId:job.jobId,reason:'No fetched primary evidence'};
  // Read public recent headlines independently; failure blocks publishing rather than silently skipping duplication review.
  const url=new URL(`https://${config.projectId}.api.sanity.io/v2026-10-01/data/query/${config.dataset}`);
  url.searchParams.set('query','*[_type == "article" && publicationState == "published"] | order(publishedAt desc)[0...50]{"title":translations.en.title,"sources":sources}');
  const recent=await fetch(url,{signal,redirect:'error'});if(!recent.ok)throw Error('Duplicate check unavailable');const recentStories=JSON.parse(await limitedText(recent,100000)).result;
  if(!Array.isArray(recentStories)||recentStories.some((r:any)=>r.sources?.includes(job.item.url)))return {state:'held',jobId:job.jobId,reason:'Existing source story or duplicate data unavailable'};
  const written=await agent('write',{item:job.item,snapshots},signal);const candidate=buildCandidate(written,job.item.url);
  const review=await agent('review',{candidate,snapshots,recentStories},signal);
  const signed=verifyAndSign(candidate,snapshots,review,config.validationSecret,activeSource(source));
  if(signal.aborted||job.leaseUntil-Date.now()<10000)throw Error('Lease too short for publish');
  const result=await worker(`/v1/jobs/${job.jobId}/publish`,{leaseToken:job.leaseToken,candidate:signed},signal);
  if(result.published!=='story.'+job.jobId)throw Error('Publication identity mismatch');
  return {state:'published',jobId:job.jobId,documentId:result.published};
 };
}
