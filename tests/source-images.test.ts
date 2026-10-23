import {expect,it,vi} from 'vitest';
import {commonsSearchQuery,parsePanewsArticleImage,pexelsSearchQuery,resolvePublishedImage} from '../workers/news/source-images';
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
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(new Response(null,{status:301,headers:{location:'https://evil.example/article'}})).mockResolvedValueOnce(Response.json({query:{pages:[]}}));
 try{expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story')).kind).toBe('illustration');expect(get).toHaveBeenCalledTimes(2);expect(get.mock.calls[0][0]).toBe('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631');expect(String(get.mock.calls[1][0])).toContain('commons.wikimedia.org/w/api.php');expect(get.mock.calls.some(([url])=>String(url).includes('evil.example'))).toBe(false);}finally{get.mockRestore();}
});
it('does not fetch arbitrary sources or promote external and credential-bearing image URLs',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[]}}));
 try{expect((await resolvePublishedImage('https://evil.test/story','story','r','Title')).kind).toBe('illustration');expect(get.mock.calls.some(([url])=>String(url)==='https://evil.test/story')).toBe(false);expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','r','Title')).kind).toBe('illustration');}finally{get.mockRestore();}
});
it('stops source-image reuse when registry rights are withdrawn',async()=>{
 const {default:inventory}=await import('../docs/research/source-checks/2026-10-22-fixed-sources.json');const row=inventory.sources.find(s=>s.id==='panews')!;const prior=row.rights_status;row.rights_status='held';
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[]}}));try{expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','r','Title')).kind).toBe('illustration');expect(get.mock.calls.some(([url])=>String(url).startsWith('https://www.panewslab.com/'))).toBe(false);}finally{row.rights_status=prior;get.mockRestore();}
});
it('turns technology headlines into descriptive stock-photo searches rather than brand names',()=>{
 expect(pexelsSearchQuery('Nvidia memory oversupply through 2029','HBM demand is rising while wafer capacity is constrained.')).toBe('semiconductor chip');
 expect(pexelsSearchQuery('Google releases global forest typology map','The AI map distinguishes forest types worldwide.')).toBe('aerial forest');
 expect(pexelsSearchQuery('Bitcoin ETF outflows continue','Investors pulled funds from spot Bitcoin products.')).toBe('cryptocurrency finance');
});
it('selects a relevant, unused Pexels landscape image and retains its required attribution',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({photos:[
  {id:11,width:1800,height:1200,url:'https://www.pexels.com/photo/used-11/',photographer:'A. One',src:{landscape:'https://images.pexels.com/photos/11/large.jpeg'}},
  {id:12,width:1800,height:1200,url:'https://www.pexels.com/photo/chip-12/',photographer:'B. Two',src:{landscape:'https://images.pexels.com/photos/12/large.jpeg'}}
 ]}));
 try{
  const plan=await resolvePublishedImage(undefined,'story','rev','Nvidia chip announcement','HBM semiconductor manufacturing','secret',['https://www.pexels.com/photo/used-11/']);
  expect(plan).toMatchObject({kind:'source',url:'https://images.pexels.com/photos/12/large.jpeg',sourceUrl:'https://www.pexels.com/photo/chip-12/',credit:'Photo by B. Two on Pexels',provider:'pexels'});
  expect(get.mock.calls[0][0]).toContain('query=semiconductor+chip');
 }finally{get.mockRestore();}
});
it('falls back to original artwork if all relevant Pexels results were already used',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({photos:[{id:11,width:1800,height:1200,url:'https://www.pexels.com/photo/used-11/',photographer:'A. One',src:{landscape:'https://images.pexels.com/photos/11/large.jpeg'}}]}));
 try{expect((await resolvePublishedImage(undefined,'story','rev','Nvidia chip announcement','HBM semiconductor manufacturing','secret',['https://www.pexels.com/photo/used-11/'])).kind).toBe('illustration');}finally{get.mockRestore();}
});
it('builds a subject-focused Wikimedia Commons search',()=>{
 expect(commonsSearchQuery('Nvidia memory chip supply outlook','HBM semiconductor manufacturing')).toBe('semiconductor chip');
 expect(commonsSearchQuery('Global forest mapping from space','AI satellite land cover')).toBe('satellite forest');
});
it('uses an unused Commons photo only when the metadata allows commercial reuse and attribution',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[
  {title:'File:Used wafer.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/1/1a/used.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Used_wafer.jpg',extmetadata:{LicenseShortName:{value:'CC BY-SA 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'},Artist:{value:'A. Used'},ImageDescription:{value:'Chip wafer'}}}]},
  {title:'File:No resale use.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/2/2b/noncommercial.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:No_resale_use.jpg',extmetadata:{LicenseShortName:{value:'CC BY-NC 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-nc/4.0/'},Artist:{value:'N. C.'}}}]},
  {title:'File:Share alike wafer.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/3/3c/share-alike.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Share_alike_wafer.jpg',extmetadata:{LicenseShortName:{value:'CC BY-SA 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'},Artist:{value:'S. A.'}}}]},
  {title:'File:Mismatched wafer.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/4/4d/mismatched.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Mismatched_wafer.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-nc/4.0/'},Artist:{value:'Mismatched Artist'}}}]},
  {title:'File:Wafer closeup.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/5/5e/wafer.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Wafer_closeup.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'Chip Artist'},ImageDescription:{value:'Wafer production line'}}}]}
 ]}}));
 try{
  const plan=await resolvePublishedImage(undefined,'story','rev','Nvidia chip supply outlook','HBM semiconductor manufacturing',undefined,['https://commons.wikimedia.org/wiki/File:Used_wafer.jpg']);
  expect(plan).toMatchObject({kind:'source',url:'https://upload.wikimedia.org/wikipedia/commons/5/5e/wafer.jpg',sourceUrl:'https://commons.wikimedia.org/wiki/File:Wafer_closeup.jpg',credit:'Photo by Chip Artist on Wikimedia Commons',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',provider:'commons'});
 }finally{get.mockRestore();}
});
