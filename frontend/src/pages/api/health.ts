import type {APIRoute} from 'astro';
import {runtimeConfig} from '../../lib/runtime';
import {createContentRepository} from '../../lib/content/repository';
export const GET:APIRoute=async()=>{
 const config=runtimeConfig();let healthy=true;try{await createContentRepository(config).listPublished('en');}catch{healthy=false;}
 return new Response(JSON.stringify({status:healthy?'ok':'unavailable',content:config.contentMode}),{status:healthy?200:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
};
