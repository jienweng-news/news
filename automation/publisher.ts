import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {normalizeLocalizedArticle} from '../frontend/src/lib/content/localized';
import {object,safeUrl,text} from '../frontend/src/lib/content/normalize';
import {locales,localeKey} from '../frontend/src/lib/i18n';
import {JobQueue} from './queue';
import {feedPublicationTime} from './feed';
export const requiredChecks=['sourceRights','primaryEvidence','claimsVerified','translationConsistency','originalWording','duplicateCheck','relationshipVerified'] as const;
export function canonical(value:unknown):string{if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical((value as any)[k])}`).join(',')}}`;return JSON.stringify(value);}
export const candidateHash=(candidate:unknown)=>createHash('sha256').update(canonical(candidate)).digest('hex');
export function signReport(hash:string,checks:Record<string,boolean>,verifiedAt:string,key:string){const payload={hash,checks,verifiedAt};return {...payload,signature:createHmac('sha256',key).update(canonical(payload)).digest('hex')};}
export function validateCandidate(input:unknown,secret?:string,now=Date.now()){
 const data=object(input),article=object(data.article);if(!article.translations||article.media||article.mainImage)throw new Error('All editions and approved image workflow required');
 const editions=locales.map(l=>normalizeLocalizedArticle({...article,id:'validation'},l));
 if(editions.some(a=>Date.parse(a.publishedAt)>now+300000))throw new Error('Future publication');
 const sources=new Set(editions[0].sources);if(!Array.isArray(data.evidence)||!data.evidence.length||data.evidence.length>20)throw new Error('Evidence required');
 for(const row of data.evidence){const evidence=object(row);if(!sources.has(safeUrl(evidence.url))||text(evidence.quote).length>1000||!/^([a-f0-9]{64})$/.test(text(evidence.contentHash)))throw new Error('Invalid evidence');}
 const report=object(data.report),checks=object(report.checks);const hash=candidateHash({article:data.article,evidence:data.evidence});
 if(!secret||secret.length<32||report.hash!==hash||requiredChecks.some(c=>checks[c]!==true))throw new Error('Independent validation required');
 const verifiedAt=text(report.verifiedAt);const age=now-Date.parse(verifiedAt);if(!Number.isFinite(age)||age<0||age>1800000)throw new Error('Stale validation');
 const expected=signReport(hash,checks as Record<string,boolean>,verifiedAt,secret).signature;const signature=text(report.signature);
 if(!/^[a-f0-9]{64}$/.test(signature)||!timingSafeEqual(Buffer.from(signature,'hex'),Buffer.from(expected,'hex')))throw new Error('Invalid validation signature');
 // Numeric tokens must agree across editions. Semantic/terminology accuracy remains a separate signed verifier obligation.
 const numbers=editions.map(a=>[...new Set((a.title+' '+a.summary+' '+a.body.flatMap(b=>b.children.map(c=>c.text)).join(' ')).match(/\d+(?:[.,]\d+)*(?:%)?/g)||[])].map(n=>n.replace(/,/g,'')).sort().join('|'));
 if(new Set(numbers).size>1)throw new Error('Edition numbers disagree');
 return {editions,hash};
}
export interface PublishConfig{enabled:boolean;killSwitch:boolean;validationSecret?:string;editorId?:string}
export async function publishJob(queue:JobQueue,id:string,candidate:unknown,config:PublishConfig,write:(doc:Record<string,unknown>)=>Promise<{id:string;hash:string}>){
 if(!config.enabled||config.killSwitch||!config.editorId||!/^[a-zA-Z0-9_-]+$/.test(config.editorId))throw new Error('Publisher disabled');
 const job=queue.get(id);if(!job)throw new Error('Unknown job');
 let validated:ReturnType<typeof validateCandidate>;try{validated=validateCandidate(candidate,config.validationSecret);}catch{if(job.state==='processing')queue.hold(id,'Candidate validation failed');throw new Error('Candidate validation failed');}const {editions,hash}=validated;if(job.state==='published'){if(job.candidate_hash!==hash)throw new Error('Published payload differs; use correction workflow');return job.document_id;}
 if(job.state!=='processing'||job.lease_until<Date.now())throw new Error('Active job lease required');
 const en=editions[0];const item=JSON.parse(job.payload);if(!en.sources.includes(item.url))throw new Error('Discovery source must be attributed');
 const documentId=`story-${id}`;
 const sourceTime=feedPublicationTime(item.publishedAt);const importedAt=new Date().toISOString();
 if(!Number.isFinite(sourceTime)||sourceTime>Date.now()+300000||!Number.isFinite(job.created_at)||job.created_at>Date.now()+300000)throw new Error('Invalid source provenance');
 const document={...publicationDocument(editions,id,config.editorId,hash),publishedAt:importedAt,updatedAt:importedAt,
  provenance:{sourceUrl:item.url,sourcePublishedAt:new Date(sourceTime).toISOString(),discoveredAt:new Date(job.created_at).toISOString(),importedAt}};
 if(!queue.lockPublisher())throw new Error('Publisher busy');
 try{const result=await write(document);if(result.id!==documentId||result.hash!==hash)throw new Error('Publication identity mismatch');queue.published(id,documentId,hash);return documentId;}catch{queue.hold(id,'Publish failed; inspect CMS before retry');throw new Error('Publication failed');}finally{queue.unlockPublisher();}
}

export function publicationDocument(editions:ReturnType<typeof validateCandidate>['editions'],id:string,editorId:string,hash:string){
 const en=editions[0];
 return {_id:`story-${id}`,_type:'article',section:en.section,format:en.format,author:{_type:'reference',_ref:editorId},publishedAt:en.publishedAt,updatedAt:en.updatedAt,language:'en',publicationState:'published',sources:en.sources,relationship:en.relationship,
 translations:Object.fromEntries(editions.map((a,i)=>[localeKey[locales[i]],{title:a.title,summary:a.summary,slug:{_type:'slug',current:a.slug},body:a.body,...(a.disclosure?{disclosure:a.disclosure}:{})}])),
 corrections:en.corrections.map((c,i)=>({date:c.date,notes:Object.fromEntries(editions.map((a,l)=>[localeKey[locales[l]],a.corrections[i]?.note||c.note]))})),automation:{jobId:id,candidateHash:hash}};
}
