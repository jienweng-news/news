import {locales,localeKey} from '../frontend/src/lib/i18n';
import {JobQueue} from './queue';
import {validateCandidate,publicationDocument,type PublishConfig} from './publisher';
function enabled(config:PublishConfig){if(!config.enabled||config.killSwitch||!config.editorId)throw new Error('Publisher disabled');}
export async function withdrawJob(queue:JobQueue,id:string,config:PublishConfig,withdraw:(documentId:string)=>Promise<void>){
 enabled(config);const job=queue.get(id);if(!job||job.state!=='published'||job.document_id!==`story.${id}`)throw new Error('Published job required');if(!queue.lockPublisher())throw new Error('Publisher busy');
 try{await withdraw(job.document_id);queue.db.prepare("UPDATE jobs SET state='withdrawn' WHERE id=?").run(id);queue.audit(id,'withdrawn',job.document_id);}finally{queue.unlockPublisher();}
}
export async function correctJob(queue:JobQueue,id:string,input:unknown,config:PublishConfig,read:(id:string)=>Promise<Record<string,any>|undefined>,replace:(doc:Record<string,unknown>,revision:string)=>Promise<void>){
 enabled(config);const job=queue.get(id);if(!job||job.state!=='published'||job.document_id!==`story.${id}`)throw new Error('Published job required');
 const {editions,hash}=validateCandidate(input,config.validationSecret);if(!queue.lockPublisher())throw new Error('Publisher busy');
 try{const existing=await read(job.document_id);const en=editions[0];if(!existing||existing.publicationState==='withdrawn'||new Date(existing.publishedAt).toISOString()!==en.publishedAt||Date.parse(en.updatedAt)<=Date.parse(existing.updatedAt)||en.corrections.length<=(existing.corrections?.length||0))throw new Error('Preserve publication time and add dated corrections');
  if(locales.some((l,i)=>existing.translations?.[localeKey[l]]?.slug?.current!==editions[i].slug))throw new Error('Preserve published edition slugs');
  const doc={...publicationDocument(editions,id,config.editorId!,hash),...(existing.provenance?{provenance:existing.provenance}:{})};await replace(doc,existing._rev);queue.published(id,job.document_id,hash);queue.audit(id,'corrected',hash);
 }finally{queue.unlockPublisher();}
}
