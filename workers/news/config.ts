import type {D1Database} from '@cloudflare/workers-types';
import {createHash,timingSafeEqual} from 'node:crypto';
export interface Env {DB:D1Database;ADMIN_TOKEN?:string;WRITER_TOKEN?:string;VALIDATION_SECRET?:string;SANITY_WRITE_TOKEN?:string;SANITY_PROJECT_ID?:string;SANITY_DATASET?:string;SANITY_EDITOR_ID?:string;RSS_POLLING_ENABLED?:string;AUTOMATION_ENABLED?:string;AUTOMATION_KILL_SWITCH?:string}
export class Refused extends Error {constructor(readonly status:number,readonly label:string){super(label);}}
export const enabled=(env:Env)=>env.AUTOMATION_ENABLED==='1'&&env.AUTOMATION_KILL_SWITCH==='0';
export function authorize(request:Request,secret?:string){
 if(!secret||secret.length<32)throw new Refused(503,'Endpoint not configured');
 const given=request.headers.get('Authorization')||'';
 const digest=(v:string)=>createHash('sha256').update(v).digest();
 if(given.length>1024||!timingSafeEqual(digest(given),digest('Bearer '+secret)))throw new Refused(401,'Unauthorized');
}
export const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
export async function limitedText(response:Response|Request,limit:number){
 const length=Number(response.headers.get('Content-Length'));if(length>limit)throw new Refused(413,'Payload too large');
 if(!response.body)return '';const reader=response.body.getReader();const decoder=new TextDecoder();let count=0,text='';
 try{while(true){const {done,value}=await reader.read();if(done)break;count+=value.byteLength;if(count>limit)throw new Refused(413,'Payload too large');text+=decoder.decode(value,{stream:true});}return text+decoder.decode();}
 finally{await reader.cancel().catch(()=>{});}
}
