import {expect,it,vi} from 'vitest';
import {parsePanewsArticleImage,resolvePublishedImage} from '../workers/news/source-images';
it('selects an image embedded in the matching PANews story body',()=>{
 const html='<article class="article-content"><p>Story</p><img src="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e" alt="Story chart"></article><aside><img src="https://uploads.panewslab.com/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"></aside>';
 expect(parsePanewsArticleImage(html)).toBe('https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e');
});
it('ignores feed banners, logos, and images outside the story body',()=>{
 const html='<meta property="og:image" content="https://uploads.panewslab.com/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"><article class="article-content"><p>Text only</p></article><aside><img src="https://uploads.panewslab.com/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"></aside>';
 expect(parsePanewsArticleImage(html)).toBeUndefined();
});
it('rejects unapproved image hosts inside PANews story bodies',()=>{
 expect(parsePanewsArticleImage('<article class="article-content"><img src="https://evil.example/image.jpg"></article>')).toBeUndefined();
});
it('uses the story page image and never the feed banner metadata',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('<article class="article-content"><img src="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e"></article>',{headers:{'content-type':'text/html'}}));
 try{const p=await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story');expect(p).toMatchObject({kind:'source',url:'https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e'});expect(get).toHaveBeenCalledWith('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631',expect.objectContaining({redirect:'manual'}));}finally{get.mockRestore();}
});
it('follows the documented PANews redirect before reading the story body',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(new Response(null,{status:301,headers:{location:'https://panews.io/articles/01a16853-4f0a-7098-997a-9864ad5b2631'}})).mockResolvedValueOnce(new Response('<article class="article-content"><img src="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e"></article>',{headers:{'content-type':'text/html'}}));
 try{expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story')).url).toBe('https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e');expect(get).toHaveBeenCalledTimes(2);expect(get.mock.calls[1][0]).toBe('https://panews.io/articles/01a16853-4f0a-7098-997a-9864ad5b2631');}finally{get.mockRestore();}
});
it('uses an original branded fallback when the PANews story contains no image',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('<article class="article-content"><p>Text only</p></article>',{headers:{'content-type':'text/html'}}));
 try{const p=await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story');expect(p.kind).toBe('illustration');expect(p.url).toContain('tokenonair.com');}finally{get.mockRestore();}
});
it('follows only PANews article redirects and refuses off-site redirects',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(new Response(null,{status:301,headers:{location:'https://evil.example/article'}}));
 try{expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story')).kind).toBe('illustration');expect(get).toHaveBeenCalledTimes(1);}finally{get.mockRestore();}
});
it('does not fetch arbitrary sources or promote external and credential-bearing image URLs',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('<meta property="og:image" content="https://evil.test/image.png">'));
 try{expect((await resolvePublishedImage('https://evil.test/story','story','r','Title')).kind).toBe('illustration');expect(get).not.toHaveBeenCalled();expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','r','Title')).kind).toBe('illustration');}finally{get.mockRestore();}
});
it('stops source-image reuse when registry rights are withdrawn',async()=>{
 const {default:inventory}=await import('../docs/research/source-checks/2026-10-22-fixed-sources.json');const row=inventory.sources.find(s=>s.id==='panews')!;const prior=row.rights_status;row.rights_status='held';
 const get=vi.spyOn(globalThis,'fetch');try{expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','r','Title')).kind).toBe('illustration');expect(get).not.toHaveBeenCalled();}finally{row.rights_status=prior;get.mockRestore();}
});
