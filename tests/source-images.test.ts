import {expect,it,vi} from 'vitest';
import {resolvePublishedImage} from '../workers/news/source-images';
it('uses a licensed PANews-hosted source image and preserves attribution',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('<meta property="og:image" content="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e">'));
 try{const p=await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story');expect(p).toMatchObject({kind:'source',url:'https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e',credit:'PANews',license:'Used with permission'});}finally{get.mockRestore();}
});
it('does not fetch arbitrary sources or promote external and credential-bearing image URLs',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('<meta property="og:image" content="https://evil.test/image.png">'));
 try{expect((await resolvePublishedImage('https://evil.test/story','story','r','Title')).kind).toBe('illustration');expect(get).not.toHaveBeenCalled();expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','r','Title')).kind).toBe('illustration');}finally{get.mockRestore();}
});
it('stops source-image reuse when registry rights are withdrawn',async()=>{
 const {default:inventory}=await import('../docs/research/source-checks/2026-10-22-fixed-sources.json');const row=inventory.sources.find(s=>s.id==='panews')!;const prior=row.rights_status;row.rights_status='held';
 const get=vi.spyOn(globalThis,'fetch');try{expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','r','Title')).kind).toBe('illustration');expect(get).not.toHaveBeenCalled();}finally{row.rights_status=prior;get.mockRestore();}
});
