import {createHash} from 'node:crypto';
import type {FeedItem} from '../feed';
import {safeFetch} from '../network';
import {activeSource,reportingEvidenceSource,sourceHosts,type Source} from '../sources';
import {buildCandidate,verifyAndSign,type Snapshot} from './coordinator';
import {limitedText} from '../../workers/news/config';
import {editorialImageRevision,sanitizeEditorialSvg} from '../../frontend/src/lib/images/policy';
import {validateImagePlan} from '../../workers/news/source-images';
type Policy=Source&{classification:string;name?:string;review?:{license?:string;attribution_name?:string;permission_status?:string}};
export interface Settings{workerUrl:string;writerToken:string;agentUrl:string;agentToken:string;validationSecret:string;sources:Policy[];projectId:string;dataset:string;acceptanceItem?:FeedItem;context?:()=>FeedItem[];canAccess?:(url:string,signal:AbortSignal)=>Promise<boolean>;collect?:(signal:AbortSignal)=>Promise<unknown>}
// These functions fetch only the fixed source registry's public HTTPS hosts, with DNS pinning and checked redirects.
export function plainText(html:string){
 let content=/<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1]||/<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(html)?.[1]||html;
 const related=content.search(/<h[2-6]\b[^>]*>\s*(?:Related posts|Related articles|You may also like)\s*</i);if(related>=0)content=content.slice(0,related);
 return content.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim().slice(0,16000);
}

export function pipeline(config:Settings){
 const acceptanceItem=config.acceptanceItem?structuredClone(config.acceptanceItem):undefined;const dryRun=!!acceptanceItem;

 async function agent(task:string,input:any,signal:AbortSignal){
  const res=await fetch(config.agentUrl+'/v1/task',{method:'POST',headers:{authorization:'Bearer '+config.agentToken,'content-type':'application/json'},body:JSON.stringify({task,input}),signal,redirect:'error'});
  if(!res.ok)throw Error('Agent unavailable');return JSON.parse(await limitedText(res,200000));
 }
 async function worker(path:string,body:any,signal:AbortSignal){
  const res=await fetch(config.workerUrl+path,{method:'POST',headers:{authorization:'Bearer '+config.writerToken,'content-type':'application/json'},body:JSON.stringify(body),signal,redirect:'error'});
  if(!res.ok)throw Error('Worker refused');return JSON.parse(await limitedText(res,65536));
 }
 async function repairOnePublishedImage(signal:AbortSignal){
  const url=new URL(`https://${config.projectId}.api.sanity.io/v2026-10-01/data/query/${config.dataset}`);
  url.searchParams.set('query','*[_type == "article" && publicationState == "published" && defined(automation.jobId) && (!defined(mainImage.asset) || coalesce(mainImage.editorialImageRevision, "") != $revision)] | order(publishedAt desc)[0...1]{"jobId":automation.jobId,"sourceUrl":provenance.sourceUrl,"title":coalesce(translations.en.title,title),"summary":coalesce(translations.en.summary,summary),"section":section,"body":translations.en.body}');url.searchParams.set('$revision',JSON.stringify(editorialImageRevision));
  const response=await fetch(url,{signal,redirect:'error'});if(!response.ok)throw Error('Image backfill query unavailable');const result=JSON.parse(await limitedText(response,262144)).result;
  if(!Array.isArray(result))throw Error('Invalid image backfill data');const story=result[0];if(!story)return {state:'idle'};
  if(typeof story.jobId!=='string'||!/^[a-f0-9]{64}$/.test(story.jobId)||typeof story.title!=='string'||typeof story.summary!=='string')throw Error('Invalid image backfill story');
  const imageSlug=story.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,180)||'editorial-story';
  const discovered=await worker('/v1/images/resolve',{sourceUrl:story.sourceUrl,slug:imageSlug,revision:story.jobId,title:story.title,summary:story.summary},signal);
  let image=validateImagePlan(discovered?.image,typeof story.sourceUrl==='string'?story.sourceUrl:'');
  if(!image){
   const paragraphs=Array.isArray(story.body)?story.body.map((block:any)=>Array.isArray(block.children)?block.children.map((span:any)=>span.text||'').join(''):'').filter(Boolean).slice(0,8):[];
   const illustration=await agent('illustrate',{section:story.section,title:story.title,summary:story.summary,reportedParagraphs:paragraphs},signal),svg=sanitizeEditorialSvg(illustration?.svg);
   if(!svg)throw Error('Codex illustration unavailable');image={kind:'generated',svg,alt:`Editorial illustration for: ${story.title}`,credit:'Token on Air · Editorial illustration',license:'© Token on Air'};
  }
  const attached=await worker(`/v1/jobs/${story.jobId}/attach-image`,{image},signal);if(attached.documentId!=='story-'+story.jobId||!attached.attached)throw Error('Image backfill identity mismatch');
  return {state:'image-attached',jobId:story.jobId,documentId:attached.documentId};
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
  if(!dryRun&&config.collect)await config.collect(AbortSignal.any([signal,AbortSignal.timeout(45000)])).catch(()=>{});
  const job=acceptanceItem?{jobId:acceptanceItem.fingerprint,leaseToken:'dry-run-only',leaseUntil:Date.now()+300000,item:acceptanceItem}:await worker('/v1/jobs/claim',{},signal);if(!job.jobId)return dryRun?{state:'idle'}:await repairOnePublishedImage(signal);
  let stage='source';let candidateForDebug:any,reviewForDebug:any;
  const hold=async(reason:string)=>{
   if(dryRun)return {state:'held',jobId:job.jobId,reason,published:false,diagnostics:{stage,candidate:candidateForDebug,review:reviewForDebug}};
   try{const held=await worker(`/v1/jobs/${job.jobId}/hold`,{leaseToken:job.leaseToken},AbortSignal.timeout(10000));if(held.held!==job.jobId)throw Error('Hold identity mismatch');return {state:'held',jobId:job.jobId,reason};}
   catch{return {state:'needs-attention',jobId:job.jobId,reason:'Remote hold unconfirmed; inspect D1 and CMS. Queue paused locally.'};}
  };
  try{
  const source=config.sources.find(s=>sourceHosts(s).has(new URL(job.item.url).hostname)&&activeSource(s));
  if(!source||job.leaseUntil-Date.now()<270000)return hold('Source policy mismatch or insufficient lease');
  const sourceTime=Date.parse(job.item.publishedAt);if(!Number.isFinite(sourceTime)||sourceTime<Date.now()-48*3600000||sourceTime>Date.now()+300000)return hold('Source story is outside the approved freshness window');
  // Licensed reports qualify only for jobs carrying that publisher's explicit attribution policy.
  const primaryHosts=new Set(config.sources.filter(s=>reportingEvidenceSource(s)&&(['ai-primary','crypto-primary'].includes(s.classification)||s.id===source.id)).flatMap(s=>[...sourceHosts(s)]));
  if(config.canAccess&&!await config.canAccess(job.item.url,signal))return hold('Source robots policy refuses article access');
  // Read public recent headlines independently; failure blocks publishing rather than silently skipping duplication review.
  const url=new URL(`https://${config.projectId}.api.sanity.io/v2026-10-01/data/query/${config.dataset}`);
  url.searchParams.set('query','*[_type == "article" && publicationState == "published"] | order(publishedAt desc)[0...50]{"title":translations.en.title,"sources":sources,"summary":translations.en.summary,section,publishedAt,updatedAt}');
  const recent=await fetch(url,{signal,redirect:'error'});if(!recent.ok)throw Error('Duplicate check unavailable');const recentStories=JSON.parse(await limitedText(recent,100000)).result;
  if(!Array.isArray(recentStories)||recentStories.some((r:any)=>r.sources?.includes(job.item.url)))return hold('Existing source story or duplicate data unavailable');
  stage='evidence';
  const original=await safeFetch(job.item.url,sourceHosts(source),{},0,signal);if(original.status!==200)throw Error('Discovery unavailable');
  const discoveryText=plainText(original.body);const snapshots:Snapshot[]=[{url:job.item.url,text:discoveryText,hash:createHash('sha256').update(discoveryText).digest('hex'),primary:primaryHosts.has(new URL(job.item.url).hostname)}];
  const linked=[...original.body.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1/gi)].flatMap(m=>{try{const u=new URL(m[2].replace(/&amp;/g,'&'),job.item.url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&primaryHosts.has(u.hostname)?[u.href]:[];}catch{return [];}});
  const related=(config.context?.()||[]).filter(i=>primaryHosts.has(new URL(i.url).hostname)).slice(0,100);
  const choices=new Set([...linked,...related.map(i=>i.url)]);
  stage='research';
  const research=await agent('research',{item:job.item,text:discoveryText,linkedPrimaryUrls:[...choices].slice(0,100),relatedLeads:related,primaryHosts:[...primaryHosts]},signal);
  if(!Array.isArray(research.primaryUrls)||research.primaryUrls.length>3)throw Error('Invalid research');
  for(const url of [...new Set<string>(research.primaryUrls)]){
   if(url===job.item.url)continue;
   if(!choices.has(url)||!primaryHosts.has(new URL(url).hostname)||config.canAccess&&!await config.canAccess(url,signal))throw Error('Unapproved or unproven primary URL');
   const fetched=await safeFetch(url,primaryHosts,{},0,signal);if(fetched.status!==200)throw Error('Primary evidence unavailable');const text=plainText(fetched.body);
   const hash=createHash('sha256').update(text).digest('hex');if(snapshots.some(s=>s.hash===hash))continue;
   snapshots.push({url,text,hash,primary:true});
  }
  if(!snapshots.some(s=>s.primary))return hold('No approved fetched primary evidence');
  stage='write';
  const licensedReporting=source.review?.permission_status==='owner-confirmed'?(source.name||source.id):undefined;
  const written=await agent('write',{item:job.item,snapshots,licensedReporting},signal);const candidate=buildCandidate(written,job.item.url);
  const licensed=config.sources.filter(s=>s.review?.license==='CC-BY-4.0'&&snapshots.some(p=>sourceHosts(s).has(new URL(p.url).hostname)));
  for(const policy of licensed)for(const locale of ['en','zh','zhCn']){
   const sourceUrl=snapshots.find(p=>sourceHosts(policy).has(new URL(p.url).hostname))!.url;
   const credit=`Source: ${policy.review?.attribution_name||policy.name||policy.id}; original authors credited at ${sourceUrl}. CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Original reporting and translations; changes made. No endorsement.`;
   const edition=(candidate.article.translations as any)[locale];edition.body.push({_type:'block',_key:'credit-'+policy.id,style:'normal',markDefs:[],children:[{_type:'span',_key:'credit-span',text:credit,marks:[]}]});
  }
  candidateForDebug=candidate;stage='review';
  const review=await agent('review',{candidate,snapshots,recentStories,licensedReporting,discovery:job.item,operatorPolicy:{relationship:'none',basis:'Independent editorial workflow configured by the publisher. No sponsor, affiliate URL or owned-project relationship is supplied. Source-company affiliations do not establish a relationship with this publisher.'}},signal);
  reviewForDebug=review;stage='signed-validation';
  const signed=verifyAndSign(candidate,snapshots,review,config.validationSecret,candidate.evidence.every((e:any)=>config.sources.some(s=>activeSource(s)&&sourceHosts(s).has(new URL(e.url).hostname))));
  if(dryRun)return {state:'validated',published:false,jobId:job.jobId,candidate:signed,snapshotUrls:snapshots.map(s=>s.url),reviewReason:review.reason};
  stage='image-discovery';
  const english=(candidate.article.translations as any).en;
  const discovered=await worker('/v1/images/resolve',{sourceUrl:job.item.url,slug:english.slug,revision:job.jobId,title:english.title,summary:english.summary},signal);
  let image=validateImagePlan(discovered?.image,job.item.url);
  if(!image){
   stage='local-illustration';
   const article=(candidate.article.translations as any).en;
   const illustration=await agent('illustrate',{section:candidate.article.section,title:article.title,summary:article.summary,reportedParagraphs:article.body.map((block:any)=>block.children?.map((span:any)=>span.text).join('')||'')},signal);
   const svg=sanitizeEditorialSvg(illustration?.svg);
   if(!svg)return hold('No suitable licensed photo or valid local illustration');
   image={kind:'generated',svg,alt:`Editorial illustration for: ${article.title}`,credit:'Token on Air · Editorial illustration',license:'© Token on Air'};
  }
  if(signal.aborted||job.leaseUntil-Date.now()<10000)throw Error('Lease too short for publish');
  stage='publish';
  const result=await worker(`/v1/jobs/${job.jobId}/publish`,{leaseToken:job.leaseToken,candidate:signed,image},signal);
  if(result.published!=='story-'+job.jobId)throw Error('Publication identity mismatch');
  return {state:'published',jobId:job.jobId,documentId:result.published};
  }catch(e){const known=['Independent review refused','Edition numbers disagree','Evidence snapshot mismatch','Primary citation required','Agent unavailable'];const cause=e instanceof Error&&known.includes(e.message)?e.message:'Refused';return hold(`Processing failed at ${stage}: ${cause}; inspect before release`);}
 };
}
