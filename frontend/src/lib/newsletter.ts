import {isLocale} from './i18n';
export interface Signup {email:string;language:'en'|'zh'|'zh-cn'|'all';consent:string}
export interface NewsletterConfig {enabled:boolean;apiKey?:string;formId?:string;languageField?:string}
export function validateSignup(input:Record<string,unknown>):Signup{
 const email=typeof input.email==='string'?input.email.trim():'';const language=input.language;
 if(email.length>254||! /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||!(isLocale(language)||language==='all')||input.consent!=='yes'||input.website)throw new Error('Invalid signup');
 return {email,language,consent:'yes'};
}
export async function subscribe(input:Record<string,unknown>,config:NewsletterConfig,send:typeof fetch=fetch):Promise<{accepted:true}>{
 const data=validateSignup(input);
 if(!config.enabled||!config.apiKey||!/^[1-9][0-9]*$/.test(config.formId||'')||!/^[a-z][a-z0-9_]*$/.test(config.languageField||''))throw new Error('Signup unavailable');
 try{
 const signal=AbortSignal.timeout(8000);
 const call=async(path:string,method:string,body:unknown)=>{
  const response=await send(`https://api.kit.com/v4/${path}`,{method,headers:{'X-Kit-Api-Key':config.apiKey!,'Content-Type':'application/json'},body:JSON.stringify(body),signal,redirect:'error'});
  if(!response.ok)throw new Error();
  const payload=await response.json();const contact=payload?.subscriber;
  if(payload.warnings?.length||!contact||!Number.isSafeInteger(contact.id)||contact.id<=0||typeof contact.email_address!=='string'||contact.email_address.toLowerCase()!==data.email.toLowerCase()||!['inactive','active'].includes(contact.state))throw new Error();
  return contact;
 };
 // Kit defaults new contacts to active, so explicitly create inactive and preserve existing suppression.
 const contact=await call('subscribers','POST',{email_address:data.email,state:'inactive'});
 const updated=await call(`subscribers/${contact.id}`,'PUT',{fields:{[config.languageField!]:data.language}});
 if(updated.id!==contact.id||updated.fields?.[config.languageField!]!==data.language)throw new Error();
 const joined=await call(`forms/${config.formId}/subscribers/${contact.id}`,'POST',{referrer:'https://tokenonair.com/'});
 if(joined.id!==contact.id)throw new Error();
 return {accepted:true};
 }catch{throw new Error('Signup unavailable');}
}
export function newsletterReady(env:Record<string,string|undefined>):boolean{return env.NEWSLETTER_ENABLED==='1'&&env.KIT_SETUP_VERIFIED==='1'&&Boolean(env.KIT_API_KEY&&/^[1-9][0-9]*$/.test(env.KIT_FORM_ID||'')&&/^[a-z][a-z0-9_]*$/.test(env.KIT_LANGUAGE_FIELD||'')&&env.TURNSTILE_SECRET_KEY&&env.PUBLIC_TURNSTILE_SITE_KEY);}
