import type {APIRoute} from 'astro';
import {isLocale} from '../../../../lib/i18n';
import {validSlug} from '../../../../lib/content/normalize';
import {createContentRepository} from '../../../../lib/content/repository';
import {runtimeConfig} from '../../../../lib/runtime';
import {renderEditorialImage} from '../../../../lib/images/editorial';
export const GET:APIRoute=async({params})=>{
 const {locale,slug}=params;
 const failure=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
 if(!isLocale(locale)||!slug||slug.length>200||!validSlug(slug))return failure(404);
 try{
  const config=runtimeConfig(),repo=createContentRepository(config),article=await repo.getPublished(slug,locale);
  if(!article)return failure(404);
  // The shared illustration uses the original English headline; page metadata/alt remain localized.
  const english=locale!=='en'&&article.localeSlugs?.en?await repo.getPublished(article.localeSlugs.en,'en'):article;
  const source=english||article;
  const png=await renderEditorialImage(source.title,article.section,source.summary);
  return new Response(new Uint8Array(png),{headers:{'Content-Type':'image/png','Cache-Control':config.contentMode==='fixture'?'no-store':'public, max-age=300, s-maxage=300','X-Content-Type-Options':'nosniff'}});
 }catch{return failure(503);}
};
