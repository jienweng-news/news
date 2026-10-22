import {expect,it} from 'vitest';
import {validateSignup,subscribe} from '../frontend/src/lib/newsletter';
import {analyticsEnabled,cleanAnalyticsPath} from '../frontend/src/lib/analytics';
it('rejects malformed subscriptions without reactivating previous contacts',async()=>{
 expect(()=>validateSignup({email:'bad',language:'zh',consent:'yes'})).toThrow();expect(()=>validateSignup({email:'a@b.com',language:'bad',consent:'yes'})).toThrow();expect(()=>validateSignup({email:'a@b.com',language:'en'})).toThrow();
 let body:any;
 const result=await subscribe({email:'reader@example.com',language:'zh',consent:'yes'},{enabled:true,apiKey:'private-key',publicationId:'pub_123',languageField:'Language'},async(_url,init)=>{body=JSON.parse(init!.body as string);return new Response(JSON.stringify({data:{status:'validating'}}),{status:200});});
 expect(result).toEqual({accepted:true});expect(body).toMatchObject({reactivate_existing:false,send_welcome_email:false,custom_fields:[{name:'Language',value:'zh'}]});
});
it('does not claim signup success on disabled or failed provider',async()=>{
 await expect(subscribe({email:'a@b.com',language:'en',consent:'yes'},{enabled:false})).rejects.toThrow();
 await expect(subscribe({email:'a@b.com',language:'en',consent:'yes'},{enabled:true,apiKey:'secret',publicationId:'pub_123',languageField:'Language'},async()=>new Response('private-provider-detail',{status:500}))).rejects.toThrow('Signup unavailable');
});
it('keeps GA4 off outside production and strips arbitrary query/identity data',()=>{
 expect(analyticsEnabled('local','sanity','G-ABC123')).toBe(false);expect(analyticsEnabled('production','sanity','bad')).toBe(false);expect(analyticsEnabled('production','sanity','G-ABC123')).toBe(true);
 expect(cleanAnalyticsPath('https://tokenonair.com/en/search/?q=reader@example.com')).toBe('/en/search/');
});
