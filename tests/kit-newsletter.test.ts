import {expect,it} from 'vitest';
import {subscribe,newsletterReady} from '../frontend/src/lib/newsletter';
const config={enabled:true,apiKey:'private-test-key',formId:'12345',languageField:'newsletter_language'};
const input={email:'reader@example.com',language:'zh',consent:'yes'};
const subscriber={id:42,email_address:input.email,state:'inactive',fields:{newsletter_language:'zh'}};
it('uses Kit server API, creates inactive contacts, persists language and joins the numeric form',async()=>{
 const calls:{url:string;body:any;headers:any}[]=[];
 const result=await subscribe(input,config,async(url,init)=>{calls.push({url:String(url),body:JSON.parse(init!.body as string),headers:init!.headers});return Response.json({subscriber});});
 expect(result).toEqual({accepted:true});expect(calls.map(c=>c.url)).toEqual(['https://api.kit.com/v4/subscribers','https://api.kit.com/v4/subscribers/42','https://api.kit.com/v4/forms/12345/subscribers/42']);
 expect(calls[0].body).toEqual({email_address:input.email,state:'inactive'});expect(calls[1].body).toEqual({fields:{newsletter_language:'zh'}});expect(calls[1].headers['X-Kit-Api-Key']).toBe(config.apiKey);
});
for(const state of ['cancelled','bounced','complained'])it(`never attaches suppressed ${state} contacts to a form`,async()=>{let calls=0;await expect(subscribe(input,config,async()=>{calls++;return Response.json({subscriber:{...subscriber,state}});})).rejects.toThrow('Signup unavailable');expect(calls).toBe(1);});
it('rejects embed UIDs rather than treating them as numeric API IDs',async()=>{let calls=0;await expect(subscribe(input,{...config,formId:'17c6e3f357'},async()=>{calls++;return Response.json({subscriber});})).rejects.toThrow();expect(calls).toBe(0);});
it('requires persisted language and complete form acceptance',async()=>{let calls=0;await expect(subscribe(input,config,async()=>{calls++;return Response.json({subscriber:{...subscriber,fields:{}}});})).rejects.toThrow();expect(calls).toBe(2);});
it('does not expose provider errors or accept incomplete provider data',async()=>{await expect(subscribe(input,config,async()=>new Response('private-details',{status:500}))).rejects.toThrow('Signup unavailable');await expect(subscribe(input,config,async()=>Response.json({}))).rejects.toThrow('Signup unavailable');});
it('keeps signup off until Kit and abuse protection setup are verified',()=>{const env={NEWSLETTER_ENABLED:'1',KIT_SETUP_VERIFIED:'1',KIT_API_KEY:'test',KIT_FORM_ID:'12345',KIT_LANGUAGE_FIELD:'newsletter_language',TURNSTILE_SECRET_KEY:'test',PUBLIC_TURNSTILE_SITE_KEY:'test'};expect(newsletterReady(env)).toBe(true);expect(newsletterReady({...env,KIT_SETUP_VERIFIED:'0'})).toBe(false);expect(newsletterReady({...env,KIT_FORM_ID:'17c6e3f357'})).toBe(false);});
