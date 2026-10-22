import type {APIRoute} from 'astro';
import {isLocale} from '../../lib/i18n';
import {runtimeConfig} from '../../lib/runtime';
import {createContentRepository} from '../../lib/content/repository';
import {buildFeed} from '../../lib/discovery';
export const GET:APIRoute=async({params})=>{
 if(!isLocale(params.locale))return new Response('Not found',{status:404});
 const config=runtimeConfig();try{return new Response(buildFeed(await createContentRepository(config).listPublished(params.locale),params.locale,config.siteUrl),{headers:{'Content-Type':'application/rss+xml; charset=utf-8','Cache-Control':config.contentMode==='fixture'?'no-store':'public, max-age=0, s-maxage=30',...(config.contentMode==='fixture'?{'X-Robots-Tag':'noindex, nofollow'}:{})}});}catch{return new Response('Feed temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
};
