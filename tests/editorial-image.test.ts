import {expect,it,vi} from 'vitest';
import sharp from 'sharp';
import {renderEditorialImage,editorialSvg} from '../frontend/src/lib/images/editorial';
import {GET} from '../frontend/src/pages/api/images/[locale]/[slug].png';
vi.mock('../frontend/src/lib/runtime',()=>({runtimeConfig:()=>({siteUrl:'https://tokenonair.com'})}));
vi.mock('../frontend/src/lib/content/repository',()=>({createContentRepository:()=>({getPublished:async(slug:string)=>slug==='published'?{title:'A real published headline',section:'ai',publishedAt:'2026-10-23T10:00:00Z'}:null})}));
const imageRequest=(locale:string,slug:string,search='')=>GET({params:{locale,slug},url:new URL(`https://tokenonair.com/api/images/${locale}/${slug}.png${search}`)} as never);
it('renders an actual 1200 by 630 PNG without executing title markup',async()=>{
 const b=await renderEditorialImage('<script>& test headline','crypto');const m=await sharp(b).metadata();expect(m.format).toBe('png');expect([m.width,m.height]).toEqual([1200,630]);
});
it('serves published graphics and refuses invalid/missing story paths',async()=>{
 expect((await imageRequest('xx','published')).status).toBe(404);
 expect((await imageRequest('en','../private')).status).toBe(404);
 expect((await imageRequest('en','missing')).status).toBe(404);
 const r=await imageRequest('en','published');expect(r.status).toBe(200);expect(r.headers.get('Content-Type')).toBe('image/png');
 expect(r.headers.get('Cache-Control')).toContain('s-maxage=300');
});
it('serves a text-free thumbnail variant separately from the full article cover',async()=>{
 const full=await imageRequest('en','published');const thumbnail=await imageRequest('en','published','?layout=thumbnail');
 expect(full.status).toBe(200);expect(thumbnail.status).toBe(200);
 expect(Buffer.from(await thumbnail.arrayBuffer()).equals(Buffer.from(await full.arrayBuffer()))).toBe(false);
});
it('resizes generated card artwork to an allowed responsive width',async()=>{
 const response=await imageRequest('en','published','?layout=thumbnail&w=480');
 const meta=await sharp(Buffer.from(await response.arrayBuffer())).metadata();
 expect(meta.width).toBe(480);expect(meta.height).toBe(252);
});

it('keeps long headlines and labels free of invalid outline coordinates',()=>{expect(editorialSvg('Ethereum postpones Hoodi Glamsterdam upgrade; replacement date unset','ai').includes('NaN')).toBe(false)});
it('provides stable, visibly different fallback compositions for different headlines',()=>{
 const variants=new Set(Array.from({length:12},(_,i)=>editorialSvg('Technology update '+i,'ai').match(/data-composition="([^"]+)"/)?.[1]));
 expect(variants.size).toBe(3);expect(variants.has(undefined)).toBe(false);
 expect(editorialSvg('Technology update','ai')).toBe(editorialSvg('Technology update','ai'));
});
it('chooses story-specific visual scenes from the headline and summary',()=>{
 expect(editorialSvg('Nvidia memory oversupply and HBM chips','ai','Advanced wafer capacity constrains chip production.')).toContain('data-subject="semiconductors"');
 expect(editorialSvg('Bitcoin ETF outflows deepen','crypto','Investors pulled funds from spot Bitcoin products.')).toContain('data-subject="markets"');
 expect(editorialSvg('Google releases forest typology map','ai','The map classifies forests around the world.')).toContain('data-subject="earth-observation"');
 expect(editorialSvg('Bitcoin network adds new wallet','crypto','A new wallet joins the blockchain.')).toContain('data-subject="crypto-network"');
});
it('renders thumbnail artwork without the embedded headline or brand wordmark',async()=>{
 const svg=editorialSvg('A distinctive thumbnail headline','ai','A topic-specific summary.',{layout:'thumbnail'});
 expect(svg).toContain('data-layout="thumbnail"');
 expect(svg).not.toContain('A distinctive thumbnail headline');
 expect(svg).not.toContain('<title id="title">Token on Air</title>');
 const full=await renderEditorialImage('A distinctive thumbnail headline','ai','A topic-specific summary.');
 const thumbnail=await renderEditorialImage('A distinctive thumbnail headline','ai','A topic-specific summary.',{layout:'thumbnail'});
 expect(thumbnail.equals(full)).toBe(false);
});
it('renders the story scene and headline as visible pixels',async()=>{
 const png=await renderEditorialImage('Nvidia memory supply remains tight','ai','Wafer capacity limits semiconductor production.');
 const {data,info}=await sharp(png).raw().toBuffer({resolveWithObject:true});let accent=0,headline=0;
 for(let y=210;y<440;y++)for(let x=886;x<1178;x++){const i=(y*info.width+x)*info.channels;if(data[i]===40&&data[i+1]===168&&data[i+2]===161)accent++;}
 const base=(520*info.width+60)*info.channels;
 for(let y=210;y<540;y++)for(let x=60;x<860;x++){const i=(y*info.width+x)*info.channels;if(Math.abs(data[i]-data[base])+Math.abs(data[i+1]-data[base+1])+Math.abs(data[i+2]-data[base+2])>60)headline++;}
 expect(accent).toBeGreaterThan(500);expect(headline).toBeGreaterThan(10000);
});
