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
 return {read,create,patch};
}
