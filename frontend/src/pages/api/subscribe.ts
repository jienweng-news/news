import type {APIRoute} from 'astro';
import {newsletterReady,subscribe} from '../../lib/newsletter';
import {isLocale} from '../../lib/i18n';
export const POST:APIRoute=async({request})=>{
 const json=request.headers.get('accept')?.includes('application/json');
 const reply=(status:number,accepted=false,locale='en')=>json?new Response(JSON.stringify({accepted}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}):new Response(null,{status:303,headers:{Location:`/${locale}/?signup=${accepted?'accepted':'unavailable'}`,'Cache-Control':'no-store'}});
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 if(!newsletterReady(process.env))return reply(503);
 const reader=request.body?.getReader();let total=0;const chunks:Uint8Array[]=[];
 if(!reader)return reply(400);
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>4096){await reader.cancel();return reply(413);}chunks.push(value);}
 const data=new URLSearchParams(new TextDecoder().decode(Buffer.concat(chunks)));const locale=isLocale(data.get('locale'))?data.get('locale')!:'en';
 try{
 const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY!,response:data.get('cf-turnstile-response')||''}),signal:AbortSignal.timeout(8000)});
 const result=await verification.json();if(!result.success||result.hostname!==new URL(request.url).hostname)return reply(400,false,locale);
 await subscribe(Object.fromEntries(data),{enabled:true,apiKey:process.env.BEEHIIV_API_KEY,publicationId:process.env.BEEHIIV_PUBLICATION_ID,languageField:process.env.BEEHIIV_LANGUAGE_FIELD});return reply(200,true,locale);
 }catch{return reply(503,false,locale);}
};
