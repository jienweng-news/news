import {expect,it} from 'vitest';
import {imagePlan} from '../frontend/src/lib/images/policy';
it('selects separate original illustrations for the reviewed Google stories',()=>{
 const forest=imagePlan('https://deepmind.google/blog/beyond-tree-cover-mapping-the-worlds-forest-types/','forest','rev','Forest');
 const ultrasound=imagePlan('https://research.google/blog/empowering-frontline-maternal-care-with-ai-assisted-ultrasound/','ultrasound','rev','Ultrasound');
 expect(forest.url).toBe('https://tokenonair.com/editorial/forest-typology-v2.png');expect(ultrasound.url).toBe('https://tokenonair.com/editorial/ultrasound-research-v2.png');expect(forest.alt).toContain('not the research map');expect(ultrasound.alt).toContain('not a patient scan');
});
it('never promotes unreviewed or lookalike source URLs into upload URLs',()=>{
 for(const source of ['https://evil.test/image.png','https://blog.ethereum.org.evil.test/en/2026/10/22/glamsterdam-hoodi-delay','https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay?fake=1'])expect(imagePlan(source,'safe-slug','rev','Story').url).toBe('https://tokenonair.com/api/images/en/safe-slug.png?revision=rev&version=source-first-v4');
});
