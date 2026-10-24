import {editorialImageRevision,imagePlan,imageVersion,rejectedImageSources,sanitizeEditorialSvg,type ImagePlan} from '../../frontend/src/lib/images/policy';
import {slugCollisionQuery} from '../../frontend/src/lib/content/slugs';
import {limitedText,Refused,type Env} from './config';
export function sanityApi(env:Env){
 if(env.SANITY_PROJECT_ID!=='4k0o7q9m'||env.SANITY_DATASET!=='production'||!env.SANITY_WRITE_TOKEN||!env.SANITY_EDITOR_ID||!/^[a-zA-Z0-9_-]+$/.test(env.SANITY_EDITOR_ID))throw new Refused(503,'Sanity publisher not configured');
 const base=`https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2026-10-22/data`;const signal=AbortSignal.timeout(20000);
 async function query(query:string,params:Record<string,unknown>){
  const url=new URL(base+'/query/production');url.searchParams.set('query',query);for(const [k,v] of Object.entries(params))url.searchParams.set('$'+k,JSON.stringify(v));
  return call(url.href);
 }
 async function call(url:string,body?:unknown){
  const r=await fetch(url,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+env.SANITY_WRITE_TOKEN,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'manual',signal});
  if(!r.ok)throw new Refused(502,'CMS request failed');return JSON.parse(await limitedText(r,262144));
 }
 const read=async(id:string)=>(await query('*[_id == $id][0]',{id})).result;
 const usedImageSources=async():Promise<string[]>=>{const rows=(await query('*[_type == "article" && publicationState == "published" && (defined(mainImage.originalImageUrl) || defined(mainImage.sourceUrl))]{"source":coalesce(mainImage.originalImageUrl,mainImage.sourceUrl)}',{})).result;return Array.isArray(rows)?rows.map((row:any)=>row?.source).filter((url:unknown):url is string=>typeof url==='string'&&(url.startsWith('https://uploads.panewslab.com/')||url.startsWith('https://www.pexels.com/photo/')||url.startsWith('https://commons.wikimedia.org/wiki/File:'))):[];};
 const mutate=async(mutations:unknown[])=>call(base+'/mutate/production?returnDocuments=true',{mutations});
 async function create(doc:Record<string,any>){
  const existing=await read(doc._id);
  if(existing){if(existing.publicationState==='withdrawn'||existing.automation?.candidateHash!==doc.automation.candidateHash)throw new Refused(409,'Existing story differs');return existing;}
  // The global D1 publisher lock serializes this worker's slug checks and writes.
  for(const localeKey of ['en','zh','zhCn']){
   const count=(await query(slugCollisionQuery,{localeKey,slug:doc.translations[localeKey].slug.current,publishedId:doc._id,draftId:'drafts.'+doc._id})).result;
   if(count!==0)throw new Refused(409,'Edition slug is already in use');
  }
  const r=await mutate([{createIfNotExists:doc}]);const saved=r.results?.[0]?.document;
  if(!saved||saved._id!==doc._id||saved.publicationState==='withdrawn'||saved.automation?.candidateHash!==doc.automation.candidateHash)throw new Refused(502,'CMS identity mismatch');return saved;
 }
 async function patch(id:string,revision:string,fields:Record<string,unknown>){
  if(!revision)throw new Refused(409,'CMS revision required');
  const r=await mutate([{patch:{id,ifRevisionID:revision,set:fields}}]);
  if(r.results?.[0]?.document?._id!==id)throw new Refused(502,'CMS identity mismatch');
 }
 async function uploadEditorialImage(slug:string,revision:string,title:string,id:string,sourceUrl?:string,suppliedPlan?:ImagePlan){
  const plan=suppliedPlan||imagePlan(sourceUrl,slug,revision,title);if(!plan)throw new Refused(422,'No source image plan available');
  if(plan.kind==='generated'){
   const svg=sanitizeEditorialSvg(plan.svg);if(!svg||plan.credit!=='Token on Air · Editorial illustration'||plan.license!=='© Token on Air')throw new Refused(422,'Invalid generated image');
   const upload=new URL(base.replace(/\/data$/,'/assets')+'/images/production');upload.searchParams.set('filename',slug+'-'+revision.slice(0,10)+'.svg');upload.searchParams.set('title',title);upload.searchParams.set('creditLine',plan.credit);
   const response=await fetch(upload.href,{method:'POST',headers:{Authorization:'Bearer '+env.SANITY_WRITE_TOKEN,'Content-Type':'image/svg+xml'},body:svg,redirect:'manual',signal});
   if(!response.ok)throw new Refused(502,'CMS image upload failed');const result=JSON.parse(await limitedText(response,262144));const asset=result.document?._id;
   if(typeof asset!=='string'||!/^image-[a-f0-9]{32,64}-1200x630-svg$/.test(asset))throw new Refused(502,'Unexpected generated image asset');return asset;
  }
  const url=new URL(base.replace(/\/data$/,'/assets')+'/images/production/from-url');
  url.searchParams.set('title',title);url.searchParams.set('creditLine',plan.credit);url.searchParams.set('sourceName',plan.credit);url.searchParams.set('sourceId',id+':'+revision);
  const result=await call(url.href,{url:plan.url,filename:slug+(plan.kind==='source'?'.jpg':'.png')});const asset=result.document?._id;
  if(typeof asset!=='string'||!(plan.kind==='source'?/^image-[a-f0-9]{32,64}-[1-9][0-9]{1,3}x[1-9][0-9]{1,3}-(?:jpg|png|webp)$/:/^image-[a-f0-9]{32,64}-1200x630-png$/).test(asset))throw new Refused(502,'Unexpected editorial image asset');
  return asset;
 }
 async function imageCandidates(excluded:string[]=[]){return (await query(`*[_type == "article" && publicationState == "published" && _id match "story-*" && defined(automation.jobId) && !(automation.jobId in $excluded) && (!defined(mainImage.asset) || coalesce(mainImage.editorialImageRevision, "") != $editorialImageRevision || mainImage.sourceUrl in $rejectedImages || (mainImage.generatedBy == "token-on-air" && mainImage.generatedAssetId == mainImage.asset._ref && (mainImage.generatedTitle != coalesce(translations.en.title,title) || coalesce(mainImage.generatedVersion,"") != $imageVersion)))] | order(publishedAt desc)[0...10]{"jobId":automation.jobId}`,{excluded,imageVersion,editorialImageRevision,rejectedImages:[...rejectedImageSources]})).result;}
 async function repairPublicId(id:string,hash:string){
  const oldId='story.'+id,newId='story-'+id;const old=await read(oldId),current=await read(newId);
  if(current&&(current.automation?.candidateHash!==hash||current.publicationState!=='published'))throw new Refused(409,'Public identity collision');
  if(!old){if(current)return newId;throw new Refused(409,'Legacy story missing');}
  if(old._type!=='article'||old.publicationState!=='published'||old.automation?.candidateHash!==hash||!old._rev)throw new Refused(409,'Legacy identity mismatch');
  const {_id,_rev,_createdAt,_updatedAt,...fields}=old;
  // One Sanity transaction: revision-fence the private source, copy unchanged content, remove old ID.
  const result=await mutate([{patch:{id:oldId,ifRevisionID:_rev,set:{publicationState:'published'}}},{createIfNotExists:{...fields,_id:newId}},{delete:{id:oldId}}]);
  if(!result.results?.some((r:any)=>r.document?._id===newId))throw new Refused(502,'Repair identity mismatch');
  return newId;
 }
 return {read,create,patch,repairPublicId,uploadEditorialImage,imageCandidates,usedImageSources};
}
