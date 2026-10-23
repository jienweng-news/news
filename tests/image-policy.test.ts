import {expect,it} from 'vitest';
import {imagePlan,rejectedImageSources} from '../frontend/src/lib/images/policy';
import {validateSourceImagePlan} from '../workers/news/source-images';

it('never falls back to source illustrations or generated imagery',()=>{
 expect(imagePlan('https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay','unused','rev','Story')).toBeUndefined();
 for(const source of ['https://deepmind.google/blog/beyond-tree-cover-mapping-the-worlds-forest-types/','https://research.google/blog/empowering-frontline-maternal-care-with-ai-assisted-ultrasound/','https://evil.test/image.png'])expect(imagePlan(source,'safe-slug','rev','Story')).toBeUndefined();
 expect(rejectedImageSources).toContain('https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay');
});

it('allows only reusable photographic source plans from the reviewed providers',()=>{
 const photo={url:'https://upload.wikimedia.org/wikipedia/commons/a/ab/Chip.jpg',alt:'Semiconductor fabrication floor',credit:'Photo by A. Photographer on Wikimedia Commons',license:'CC BY 4.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Chip.jpg',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',provider:'commons',kind:'source'};
 expect(validateSourceImagePlan(photo,'https://news.example/story')).toMatchObject(photo);
 expect(validateSourceImagePlan({...photo,url:'https://evil.example/photo.jpg'},'https://news.example/story')).toBeUndefined();
 expect(validateSourceImagePlan({...photo,license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},'https://news.example/story')).toBeUndefined();
 expect(validateSourceImagePlan({...photo,sourceUrl:'https://commons.wikimedia.org/wiki/File:Chip.jpg?download=1'},'https://news.example/story')).toBeUndefined();
 expect(validateSourceImagePlan({url:'https://blog.ethereum.org/images/eth-org.jpeg',alt:'Official source illustration',credit:'Ethereum Foundation',license:'CC BY 4.0 · Unmodified',sourceUrl:'https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',kind:'source'},'https://news.example/story')).toBeUndefined();
});
it('requires PANews image URL identity before an owner-permitted source image can publish',()=>{
 const article='https://www.panewslab.com/en/articles/01a168c0-581e-71a2-9335-0fd14fa3dfb8',image='https://uploads.panewslab.com/5bee5808-d018-409d-9257-89c453c91b2b';
 const plan={url:image,originalImageUrl:image,alt:'Story photograph',credit:'PANews',license:'Used with permission',sourceUrl:article,kind:'source'};
 expect(validateSourceImagePlan(plan,article)).toMatchObject(plan);
 expect(validateSourceImagePlan({...plan,originalImageUrl:'https://uploads.panewslab.com/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'},article)).toBeUndefined();
});

it('marks the irrelevant Crypto Winter artwork for historical image refresh',()=>{
 expect(rejectedImageSources).toContain('https://commons.wikimedia.org/wiki/File:Crypto_Winter_-_Frozen_Cryptocurrencies.jpg');
});
