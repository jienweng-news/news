import {expect,it,vi} from 'vitest';
import {commonsSearchQuery,parsePanewsArticleImage,parsePanewsFeedImage,panewsFeedImageUseCount,pexelsSearchQuery,resolvePublishedImage,validateSourceImagePlan} from '../workers/news/source-images';
it('accepts a licensed Commons thumbnail selected by discovery at the publisher boundary',async()=>{
 const photo={title:'File:Bitcoin on Laptop Keyboard.jpg',imageinfo:[{thumburl:'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Bitcoin_on_Laptop_Keyboard.jpg/1280px-Bitcoin_on_Laptop_Keyboard.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Bitcoin_on_Laptop_Keyboard.jpg',extmetadata:{LicenseShortName:{value:'CC BY 2.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/2.0'},Artist:{value:'Satheesh Sankaran'},ImageDescription:{value:'Bitcoin on Laptop Keyboard'}}}]};
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[photo]}}));
 try{
  const plan=await resolvePublishedImage(undefined,'bitcoin-price','rev','Bitcoin falls below 81000');
  expect(validateSourceImagePlan(plan,'https://www.panewslab.com/en/articles/story')).toMatchObject({provider:'commons',url:photo.imageinfo[0].thumburl});
  for(const url of ['https://thumb.wikimedia.org.evil.test/wikipedia/commons/bitcoin.jpg','https://user@thumb.wikimedia.org/wikipedia/commons/bitcoin.jpg','https://thumb.wikimedia.org:444/wikipedia/commons/bitcoin.jpg','https://thumb.wikimedia.org/not-commons/bitcoin.jpg'])expect(validateSourceImagePlan({...plan,url},'https://www.panewslab.com/en/articles/story')).toBeUndefined();
 }finally{get.mockRestore();}
});
it('selects an image embedded in the matching PANews story body',()=>{
 const html='<article class="article-content"><p>Story</p><img src="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e" alt="Story chart"></article><aside><img src="https://uploads.panewslab.com/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"></aside>';
 expect(parsePanewsArticleImage(html)).toBe('https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e');
});
it('selects the media image only from the exact matching PANews RSS item',()=>{
 const feed='<rss><item><link>https://www.panewslab.com/en/articles/other-story</link><media:content url="https://uploads.panewslab.com/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" medium="image" /></item><item><link>https://www.panewslab.com/en/articles/01a168c0-581e-71a2-9335-0fd14fa3dfb8</link><media:content url="https://uploads.panewslab.com/5bee5808-d018-409d-9257-89c453c91b2b" medium="image" /></item></rss>';
 expect(parsePanewsFeedImage(feed,'https://www.panewslab.com/en/articles/01a168c0-581e-71a2-9335-0fd14fa3dfb8')).toBe('https://uploads.panewslab.com/5bee5808-d018-409d-9257-89c453c91b2b');
 expect(panewsFeedImageUseCount(feed,'https://uploads.panewslab.com/5bee5808-d018-409d-9257-89c453c91b2b')).toBe(1);
});
it('rejects PANews RSS banners reused on multiple story items',()=>{
 const image='https://uploads.panewslab.com/5bee5808-d018-409d-9257-89c453c91b2b';
 const feed=`<rss><item><link>https://www.panewslab.com/en/articles/one-story</link><media:content url="${image}" medium="image" /></item><item><link>https://www.panewslab.com/en/articles/two-story</link><media:content url="${image}" medium="image" /></item></rss>`;
 expect(parsePanewsFeedImage(feed,'https://www.panewslab.com/en/articles/one-story')).toBeUndefined();
});
it('also rejects repeated PANews content images in encoded bodies',()=>{
 const image='https://uploads.panewslab.com/5bee5808-d018-409d-9257-89c453c91b2b';
 const feed=`<rss><item><link>https://www.panewslab.com/en/articles/one-story</link><content:encoded><![CDATA[<img src="${image}">]]></content:encoded></item><item><link>https://www.panewslab.com/en/articles/two-story</link><content:encoded><![CDATA[<img src="${image}">]]></content:encoded></item></rss>`;
 expect(parsePanewsFeedImage(feed,'https://www.panewslab.com/en/articles/one-story')).toBeUndefined();
});
it('ignores feed banners, logos, and images outside the story body',()=>{
 const html='<meta property="og:image" content="https://uploads.panewslab.com/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"><article class="article-content"><p>Text only</p></article><aside><img src="https://uploads.panewslab.com/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"></aside>';
 expect(parsePanewsArticleImage(html)).toBeUndefined();
});
it('rejects unapproved image hosts inside PANews story bodies',()=>{
 expect(parsePanewsArticleImage('<article class="article-content"><img src="https://evil.example/image.jpg"></article>')).toBeUndefined();
});
it('uses the story page image and never the feed banner metadata',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(new Response('<article class="article-content"><img src="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e"></article>',{headers:{'content-type':'text/html'}})).mockResolvedValueOnce(new Response('<rss><item><link>https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631</link><media:content url="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e" medium="image" /></item></rss>',{headers:{'content-type':'application/rss+xml'}}));
 try{const p=await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story');expect(get).toHaveBeenCalled();expect(p).toMatchObject({kind:'source',url:'https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e'});expect(get).toHaveBeenCalledWith('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631',expect.objectContaining({redirect:'manual'}));}finally{get.mockRestore();}
});
it('follows the documented PANews redirect before reading the story body',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(new Response(null,{status:301,headers:{location:'https://panews.io/articles/01a16853-4f0a-7098-997a-9864ad5b2631'}})).mockResolvedValueOnce(new Response('<article class="article-content"><img src="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e"></article>',{headers:{'content-type':'text/html'}})).mockResolvedValueOnce(new Response('<rss><item><link>https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631</link><media:content url="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e" medium="image" /></item></rss>',{headers:{'content-type':'application/rss+xml'}}));
 try{expect((await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story')).url).toBe('https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e');expect(get).toHaveBeenCalledTimes(3);expect(get.mock.calls[1][0]).toBe('https://panews.io/articles/01a16853-4f0a-7098-997a-9864ad5b2631');}finally{get.mockRestore();}
});
it('uses the matching PANews RSS image when the article body contains no image',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(new Response('<article class="article-content"><p>Text only</p></article>',{headers:{'content-type':'text/html'}})).mockResolvedValueOnce(new Response('<rss><item><link>https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631</link><media:content url="https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e" medium="image" /></item></rss>',{headers:{'content-type':'application/rss+xml'}}));
 try{const p=await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story');expect(p).toMatchObject({kind:'source',url:'https://uploads.panewslab.com/2edcab5f-2557-48b4-96da-6c558160538e'});}finally{get.mockRestore();}
});
it('follows only PANews article redirects and refuses off-site redirects',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValueOnce(new Response(null,{status:301,headers:{location:'https://evil.example/article'}})).mockResolvedValueOnce(new Response('<rss></rss>',{headers:{'content-type':'application/rss+xml'}})).mockResolvedValueOnce(Response.json({query:{pages:[]}}));
 try{expect(await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','rev','Story')).toBeUndefined();expect(get).toHaveBeenCalledTimes(3);expect(get.mock.calls[0][0]).toBe('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631');expect(String(get.mock.calls[1][0])).toContain('panewslab.com/rss.xml');expect(String(get.mock.calls[2][0])).toContain('commons.wikimedia.org/w/api.php');expect(get.mock.calls.some(([url])=>String(url).includes('evil.example'))).toBe(false);}finally{get.mockRestore();}
});
it('does not fetch arbitrary sources or promote external and credential-bearing image URLs',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[]}}));
 try{expect(await resolvePublishedImage('https://evil.test/story','story','r','Title')).toBeUndefined();expect(get.mock.calls.some(([url])=>String(url)==='https://evil.test/story')).toBe(false);expect(await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','r','Title')).toBeUndefined();}finally{get.mockRestore();}
});
it('stops source-image reuse when registry rights are withdrawn',async()=>{
 const {default:inventory}=await import('../docs/research/source-checks/2026-10-22-fixed-sources.json');const row=inventory.sources.find(s=>s.id==='panews')!;const prior=row.rights_status;row.rights_status='held';
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[]}}));try{expect(await resolvePublishedImage('https://www.panewslab.com/en/articles/01a16853-4f0a-7098-997a-9864ad5b2631','story','r','Title')).toBeUndefined();expect(get.mock.calls.some(([url])=>String(url).startsWith('https://www.panewslab.com/'))).toBe(false);}finally{row.rights_status=prior;get.mockRestore();}
});
it('turns technology headlines into descriptive stock-photo searches rather than brand names',()=>{
 expect(pexelsSearchQuery('Nvidia memory oversupply through 2029','HBM demand is rising while wafer capacity is constrained.')).toBe('semiconductor chip');
 expect(pexelsSearchQuery('Google releases global forest typology map','The AI map distinguishes forest types worldwide.')).toBe('forest canopy');
 expect(pexelsSearchQuery('Google reports AI ultrasound study','Pregnancy dating accuracy from fetal ultrasound images.')).toBe('pregnancy ultrasound');
 expect(pexelsSearchQuery('Bitcoin ETF outflows continue','Investors pulled funds from spot Bitcoin products.')).toBe('bitcoin');
 expect(pexelsSearchQuery('Spot gold slips below $4,000 an ounce','Gold fell as traders took profits.')).toBe('gold bullion bar');
 expect(pexelsSearchQuery('Cysic plans token burn after bridge security incident','Cross-chain bridge exploit and token burn')).toBe('blockchain bridge security');
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
it('does not use generated artwork if all relevant Pexels results were already used',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({photos:[{id:11,width:1800,height:1200,url:'https://www.pexels.com/photo/used-11/',photographer:'A. One',src:{landscape:'https://images.pexels.com/photos/11/large.jpeg'}}]}));
 try{expect(await resolvePublishedImage(undefined,'story','rev','Nvidia chip announcement','HBM semiconductor manufacturing','secret',['https://www.pexels.com/photo/used-11/'])).toBeUndefined();}finally{get.mockRestore();}
});
it('builds a subject-focused Wikimedia Commons search',()=>{
 expect(commonsSearchQuery('Nvidia memory chip supply outlook','HBM semiconductor manufacturing')).toBe('semiconductor chip');
 expect(commonsSearchQuery('Global forest mapping from space','AI satellite land cover')).toBe('forest canopy');
 expect(commonsSearchQuery('Google AI ultrasound pregnancy study','Fetal scan and gestational age.')).toBe('ultrasound scan fetal');
 expect(commonsSearchQuery('CZ tells founders to execute','Founders should demonstrate results.')).toBe('Changpeng Zhao');
 expect(commonsSearchQuery('Apple edges ahead of Nvidia in market value','Stock market cap rises.')).toBe('stock market trading screen');
 expect(commonsSearchQuery('Trader Killa sees a Bitcoin rebound','BTC market setup')).toBe('bitcoin');
 expect(commonsSearchQuery('Spot gold slips below $4,000 an ounce','Gold fell as traders took profits.')).toBe('gold bullion bar');
});
it('rejects a stock-exchange image as a substitute for gold coverage',async()=>{
 const photo={title:'File:NASDAQ stock market display.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/a/ab/nasdaq.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:NASDAQ_stock_market_display.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'A. Photographer'},ImageDescription:{value:'Stock market display at NASDAQ.'}}}]};
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[photo]}}));
 try{expect(await resolvePublishedImage(undefined,'gold-price','rev','Spot gold slips below $4,000 an ounce','Gold bullion prices fell')).toBeUndefined();}finally{get.mockRestore();}
});
it('uses an unused Commons photo only when the metadata allows commercial reuse and attribution',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[
  {title:'File:Used wafer.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/1/1a/used.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Used_wafer.jpg',extmetadata:{LicenseShortName:{value:'CC BY-SA 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'},Artist:{value:'A. Used'},ImageDescription:{value:'Chip wafer'}}}]},
  {title:'File:No resale use.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/2/2b/noncommercial.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:No_resale_use.jpg',extmetadata:{LicenseShortName:{value:'CC BY-NC 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-nc/4.0/'},Artist:{value:'N. C.'}}}]},
  {title:'File:Share alike wafer.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/3/3c/share-alike.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Share_alike_wafer.jpg',extmetadata:{LicenseShortName:{value:'CC BY-SA 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'},Artist:{value:'S. A.'}}}]},
  {title:'File:Mismatched wafer.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/4/4d/mismatched.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Mismatched_wafer.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-nc/4.0/'},Artist:{value:'Mismatched Artist'}}}]},
  {title:'File:Wafer closeup.jpg',imageinfo:[{thumburl:'https://thumb.wikimedia.org/wikipedia/commons/5/5e/wafer.jpg?utm_source=commons.wikimedia.org',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Wafer_closeup.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'Chip Artist'},ImageDescription:{value:'Wafer production line'}}}]}
 ]}}));
 try{
  const plan=await resolvePublishedImage(undefined,'story','rev','Nvidia chip supply outlook','HBM semiconductor manufacturing',undefined,['https://commons.wikimedia.org/wiki/File:Used_wafer.jpg']);
  expect(plan).toMatchObject({kind:'source',url:'https://thumb.wikimedia.org/wikipedia/commons/5/5e/wafer.jpg',sourceUrl:'https://commons.wikimedia.org/wiki/File:Wafer_closeup.jpg',credit:'Photo by Chip Artist on Wikimedia Commons',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',provider:'commons'});
 }finally{get.mockRestore();}
});
it('rejects AI promotional graphics and selects a real server-room photograph instead',async()=>{
 const photo={title:'File:Technician working on data center servers.jpg',imageinfo:[{thumburl:'https://thumb.wikimedia.org/wikipedia/commons/a/ab/servers.jpg?utm_source=commons',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Technician_working_on_data_center_servers.jpg',extmetadata:{LicenseShortName:{value:'CC0'},LicenseUrl:{value:'https://creativecommons.org/publicdomain/zero/1.0/'},Artist:{value:'A. Photographer'},ImageDescription:{value:'Technician checking server racks in a data center.'}}}]};
 const graphic={title:'File:Artificial Intelligence graphic.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/1/2a/ai.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Artificial_Intelligence_graphic.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'A. Artist'},ImageDescription:{value:'An image for blogs and news sites dealing with AI and machine learning.'}}}]};
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[graphic,photo]}}));
 try{const plan=await resolvePublishedImage(undefined,'ai-safety','rev','StarkWare member turns to AI safety research','Artificial intelligence research and data centers');expect(plan).toMatchObject({provider:'commons',sourceUrl:'https://commons.wikimedia.org/wiki/File:Technician_working_on_data_center_servers.jpg',url:'https://thumb.wikimedia.org/wikipedia/commons/a/ab/servers.jpg'});expect(get.mock.calls[0][0]).toContain('data+center+server+racks');}finally{get.mockRestore();}
});
it('finds a distinct Bitcoin photo for market coverage after rejecting its previous graphic',async()=>{
 const photo={title:'File:Bitcoin medallion in wallet.jpg',imageinfo:[{thumburl:'https://thumb.wikimedia.org/wikipedia/commons/8/87/Bitcoin_Medallion_in_Wallet.jpg?utm_source=commons',width:4000,height:2667,descriptionurl:'https://commons.wikimedia.org/wiki/File:Bitcoin_Medallion_in_Wallet.jpg',extmetadata:{LicenseShortName:{value:'CC BY 2.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/2.0/'},Artist:{value:'CryptoWallet.com Images'},ImageDescription:{value:'A photo of a Bitcoin medallion being placed into a wallet.'}}}]};
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[photo]}}));
 try{const plan=await resolvePublishedImage(undefined,'bitcoin-sideways','rev','Yi Lihua says Bitcoin’s sideways trading tests patience','Bitcoin range-bound trading after a pullback',undefined,['https://commons.wikimedia.org/wiki/File:Crypto_Winter-_The_Crypto_Winter_of_2022.jpg']);expect(plan).toMatchObject({provider:'commons',sourceUrl:'https://commons.wikimedia.org/wiki/File:Bitcoin_Medallion_in_Wallet.jpg',credit:'Photo by CryptoWallet.com Images on Wikimedia Commons'});expect(get.mock.calls[0][0]).toContain('gsrsearch=filetype%3Abitmap+bitcoin');}finally{get.mockRestore();}
});
it('searches real crypto infrastructure photos for security-incident reporting',()=>{
 expect(commonsSearchQuery('Cysic plans to burn tokens after a bridge security incident','Protocol exploit and token burn')).toBe('blockchain bridge security');
});
it('rejects a mining-rig photo as unrelated to a cross-chain bridge incident',async()=>{
 const photo={title:'File:Rack for FPGA BiXBiT.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/a/ab/miners.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Rack_for_FPGA_BiXBiT.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'A. Photographer'},ImageDescription:{value:'Mining equipment in a server rack.'}}}]};
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[photo]}}));
 try{expect(await resolvePublishedImage(undefined,'cysic-bridge-security','rev','Cysic plans token burn after bridge security incident','Cross-chain bridge exploit and token burn')).toBeUndefined();}finally{get.mockRestore();}
});
it('discovers a real Ethereum photograph instead of reusing the source illustration',async()=>{
 const photo={title:'File:Close-up of a physical Ethereum coin (51002904687).jpg',imageinfo:[{thumburl:'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/ethereum.jpg/1280px-ethereum.jpg?utm_source=commons',width:6048,height:4024,descriptionurl:'https://commons.wikimedia.org/wiki/File:Close-up_of_a_physical_Ethereum_coin_(51002904687).jpg',extmetadata:{LicenseShortName:{value:'CC BY 2.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/2.0'},Artist:{value:'Ivan Radic'},ImageDescription:{value:'Close-up photograph of a physical Ethereum coin.'}}}]};
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[photo]}}));
 try{const plan=await resolvePublishedImage('https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay','ethereum-upgrade','rev','Ethereum postpones Hoodi Glamsterdam upgrade','Ethereum upgrade postponement');expect(plan).toMatchObject({provider:'commons',sourceUrl:'https://commons.wikimedia.org/wiki/File:Close-up_of_a_physical_Ethereum_coin_(51002904687).jpg',credit:'Photo by Ivan Radic on Wikimedia Commons',license:'CC BY 2.0'});expect(String(get.mock.calls[0][0])).toContain('ethereum+coin+close+up');}finally{get.mockRestore();}
});
it('skips the rejected historical artwork and refuses a generic coin photo for bridge-incident coverage',async()=>{
 const bad={title:'File:Crypto Winter - Frozen Cryptocurrencies.jpg',imageinfo:[{thumburl:'https://thumb.wikimedia.org/wikipedia/commons/a/ab/winter.jpg',width:1600,height:900,descriptionurl:'https://commons.wikimedia.org/wiki/File:Crypto_Winter_-_Frozen_Cryptocurrencies.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'A. Photographer'},ImageDescription:{value:'Cryptocurrency in a winter market, decorative graphic'}}}]};
 const photo={title:'File:Cryptocurrency coin in hand.jpg',imageinfo:[{thumburl:'https://thumb.wikimedia.org/wikipedia/commons/a/ab/crypto.jpg?utm_source=commons',width:1600,height:900,descriptionurl:'https://commons.wikimedia.org/wiki/File:Cryptocurrency_coin_in_hand.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'B. Photographer'},ImageDescription:{value:'A photograph of a person holding a cryptocurrency token.'}}}]};
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[bad,photo]}}));
 try{expect(await resolvePublishedImage(undefined,'cysic-bridge-security','rev','Cysic plans token burn after bridge security incident','Cysic plans to burn tokens after a bridge incident',undefined,['https://commons.wikimedia.org/wiki/File:Crypto_Winter_-_Frozen_Cryptocurrencies.jpg'])).toBeUndefined();}finally{get.mockRestore();}
});
it('rejects cryptocurrency-law photos for Bitcoin market stories',async()=>{
 const photo={title:'File:Cryptocurrency Regulation & Laws.jpg',imageinfo:[{thumburl:'https://upload.wikimedia.org/wikipedia/commons/a/ab/laws.jpg',width:1800,height:1200,descriptionurl:'https://commons.wikimedia.org/wiki/File:Cryptocurrency_Regulation_%26_Laws.jpg',extmetadata:{LicenseShortName:{value:'CC BY 2.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/2.0/'},Artist:{value:'A. Photographer'},ImageDescription:{value:'Cryptocurrency medallions and a judge gavel for an article on cryptocurrency laws.'}}}]};
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({query:{pages:[photo]}}));
 try{expect(await resolvePublishedImage(undefined,'bitcoin-range','rev','Trader Killa sees Bitcoin range forming around $80,000','Bitcoin price action and range trading')).toBeUndefined();}finally{get.mockRestore();}
});
