import type {APIRoute} from 'astro';
import {locales,type Locale} from '../lib/i18n';
import {runtimeConfig} from '../lib/runtime';
import {createContentRepository} from '../lib/content/repository';
import {buildSitemap} from '../lib/discovery';
import type {ArticleCard} from '../lib/content/types';
export const GET:APIRoute=async()=>{
 const config=runtimeConfig();const repo=createContentRepository(config);
 try{const editions=Object.fromEntries(await Promise.all(locales.map(async l=>[l,await repo.listPublished(l)]))) as Record<Locale,ArticleCard[]>;return new Response(buildSitemap(editions,config.siteUrl),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':config.contentMode==='fixture'?'no-store':'public, max-age=0, s-maxage=30',...(config.contentMode==='fixture'?{'X-Robots-Tag':'noindex, nofollow'}:{})}});}catch{return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
};
