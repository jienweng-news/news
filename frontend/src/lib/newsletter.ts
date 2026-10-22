import {isLocale} from './i18n';
export interface Signup {email:string;language:'en'|'zh'|'zh-cn'|'all';consent:string}
export interface NewsletterConfig {enabled:boolean;apiKey?:string;publicationId?:string;languageField?:string}
export function validateSignup(input:Record<string,unknown>):Signup{
 const email=typeof input.email==='string'?input.email.trim():'';const language=input.language;
 if(email.length>254||! /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||!(isLocale(language)||language==='all')||input.consent!=='yes'||input.website)throw new Error('Invalid signup');
 return {email,language,consent:'yes'};
}
export async function subscribe(input:Record<string,unknown>,config:NewsletterConfig,send:typeof fetch=fetch):Promise<{accepted:true}>{
 const data=validateSignup(input);
 if(!config.enabled||!config.apiKey||!/^pub_[a-fA-F0-9-]+$/.test(config.publicationId||'')||!config.languageField)throw new Error('Signup unavailable');
 try{
 const response=await send(`https://api.beehiiv.com/v2/publications/${config.publicationId}/subscriptions`,{method:'POST',headers:{Authorization:`Bearer ${config.apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({email:data.email,reactivate_existing:false,send_welcome_email:false,double_opt_override:'on',custom_fields:[{name:config.languageField,value:data.language}],utm_source:'tokenonair',utm_medium:'website'}),signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw new Error();
 const payload=await response.json();if(!payload?.data||payload.warnings?.length)throw new Error();
 return {accepted:true};
 }catch{throw new Error('Signup unavailable');}
}
export function newsletterReady(env:Record<string,string|undefined>):boolean{return env.NEWSLETTER_ENABLED==='1'&&env.BEEHIIV_SETUP_VERIFIED==='1'&&Boolean(env.BEEHIIV_API_KEY&&env.BEEHIIV_PUBLICATION_ID&&env.BEEHIIV_LANGUAGE_FIELD&&env.TURNSTILE_SECRET_KEY&&env.PUBLIC_TURNSTILE_SITE_KEY);}
