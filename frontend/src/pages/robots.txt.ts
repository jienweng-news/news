import type {APIRoute} from 'astro';
import {runtimeConfig} from '../lib/runtime';
export const GET:APIRoute=()=>{const c=runtimeConfig();return new Response(c.appEnv!=='production'||c.contentMode==='fixture'?'User-agent: *\nDisallow: /\n':`User-agent: *\nDisallow: /preview/\nDisallow: /api/\nSitemap: ${c.siteUrl}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});};
