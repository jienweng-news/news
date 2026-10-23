import {expect,it} from 'vitest';
import {readFile} from 'node:fs/promises';

it('puts a localized Advertise link in the primary navigation',async()=>{
 const source=await readFile('frontend/src/layouts/BaseLayout.astro','utf8');
 expect(source).toMatch(/href:localePath\(locale,'advertise'\),label:t\(locale,'advertise'\)/);
});

it('offers a real Formspree inquiry form when configured and a working email fallback otherwise',async()=>{
 const source=await readFile('frontend/src/components/AdvertisePage.astro','utf8');
 expect(source).toContain('PUBLIC_FORMSPREE_ENDPOINT');
 expect(source).toContain('formspree\\.io');
 for(const field of ['name="name"','name="email"','name="company"','name="service"','name="message"'])expect(source).toContain(field);
 expect(source).toContain("const email='hello@tokenonair.com'");
 expect(source).toContain('mailto:${email}');
 expect(source).toContain('name="_gotcha"');
});
