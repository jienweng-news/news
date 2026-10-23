import {resolvePublishedImage} from './source-images';
import {imageVersion,rejectedImageSources} from '../../frontend/src/lib/images/policy';
import {Refused,type Env} from './config';
import {sanityApi} from './sanity';
import {D1Store} from './store';
export async function attachPublishedImage(env:Env,store:D1Store,id:string){
 const job=await store.get(id);
 if(!job||job.state!=='published'||!job.candidate_hash)throw new Refused(409,'Published job required');
 const owner=crypto.randomUUID();if(!await store.lock(owner))throw new Refused(409,'Publisher busy');
 try{
  const api=sanityApi(env),doc=await api.read('story-'+id);
  if(!doc||doc._id!=='story-'+id||doc._type!=='article'||doc.publicationState!=='published'||doc.automation?.candidateHash!==job.candidate_hash||!doc._rev)throw new Refused(409,'Published CMS identity required');
  const title=doc.translations?.en?.title||doc.title,slug=doc.translations?.en?.slug?.current||doc.slug?.current;
  if(typeof title!=='string'||!title.trim()||title.length>200||typeof slug!=='string'||slug.length>200||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Refused(409,'Published image metadata required');
  if(doc.mainImage?.asset&&!rejectedImageSources.some(source=>source===doc.mainImage?.sourceUrl)&&(doc.mainImage.generatedBy!=='token-on-air'||doc.mainImage.generatedAssetId!==doc.mainImage.asset._ref||(doc.mainImage.generatedTitle===title&&doc.mainImage.generatedVersion===imageVersion)))return {documentId:doc._id,assetId:doc.mainImage.asset._ref,preserved:true};
  const usedImageSources=await api.usedImageSources();
  const plan=await resolvePublishedImage(doc.provenance?.sourceUrl,slug,doc._rev,title,doc.translations?.en?.summary||doc.summary||'',env.PEXELS_API_KEY,usedImageSources);if(!plan)throw new Refused(422,'No suitable licensed real image found');
  const assetId=await api.uploadEditorialImage(slug,doc._rev,title,id,doc.provenance?.sourceUrl,plan);
  const mainImage={_type:'image',asset:{_type:'reference',_ref:assetId},alt:plan.alt,credit:plan.credit,license:plan.license,...('sourceUrl' in plan?{sourceUrl:plan.sourceUrl,licenseUrl:plan.licenseUrl}:{}),...(plan.originalImageUrl?{originalImageUrl:plan.originalImageUrl}:{}),generatedVersion:imageVersion,generatedBy:'token-on-air',generatedTitle:title,generatedAssetId:assetId};
  await api.patch(doc._id,doc._rev,{mainImage});
  const saved=await api.read(doc._id);
  if(saved?.mainImage?.asset?._ref!==assetId||saved.publicationState!=='published')throw new Refused(502,'Image attachment not verified');
  await store.audit(id,'image-attached');return {documentId:doc._id,assetId,attached:true};
 }finally{await store.unlock(owner);}
}
export async function retryPublishedImage(env:Env){
 const store=new D1Store(env.DB);
 const recent=await env.DB.prepare("SELECT DISTINCT job FROM audit WHERE event='image-retry-pending' AND time>? ORDER BY time DESC LIMIT 100").bind(Date.now()-3600000).all<{job:string}>();
 const candidates=await sanityApi(env).imageCandidates(recent.results.map(row=>row.job));
 if(!Array.isArray(candidates))throw new Refused(502,'Invalid image candidates');
 for(const candidate of candidates){
  if(typeof candidate.jobId!=='string'||!(/^[a-f0-9]{64}$/).test(candidate.jobId))continue;
  const job=await store.get(candidate.jobId);if(!job||job.state!=='published')continue;
  try{return await attachPublishedImage(env,store,job.id);}catch{await store.audit(job.id,'image-retry-pending');return {pending:job.id};}
 }
 return {idle:true};
}
