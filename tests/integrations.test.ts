import {expect,it} from 'vitest';
import {validateSignup,subscribe} from '../frontend/src/lib/newsletter';
import {analyticsEnabled,cleanAnalyticsPath} from '../frontend/src/lib/analytics';
it('rejects malformed subscriptions',()=>{
 expect(()=>validateSignup({email:'bad',language:'zh',consent:'yes'})).toThrow();expect(()=>validateSignup({email:'a@b.com',language:'bad',consent:'yes'})).toThrow();expect(()=>validateSignup({email:'a@b.com',language:'en'})).toThrow();
});
it('does not claim signup success on disabled or failed provider',async()=>{
 await expect(subscribe({email:'a@b.com',language:'en',consent:'yes'},{enabled:false})).rejects.toThrow();
 await expect(subscribe({email:'a@b.com',language:'en',consent:'yes'},{enabled:true,apiKey:'secret',formId:'12345',languageField:'newsletter_language'},async()=>new Response('private-provider-detail',{status:500}))).rejects.toThrow('Signup unavailable');
});
it('keeps GA4 off outside production and strips arbitrary query/identity data',()=>{
 expect(analyticsEnabled('local','sanity','G-ABC123')).toBe(false);expect(analyticsEnabled('production','sanity','bad')).toBe(false);expect(analyticsEnabled('production','sanity','G-ABC123')).toBe(true);
 expect(cleanAnalyticsPath('https://tokenonair.com/en/search/?q=reader@example.com')).toBe('/en/search/');
});
