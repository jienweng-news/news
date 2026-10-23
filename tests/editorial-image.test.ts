import {expect,it,vi} from 'vitest';
import sharp from 'sharp';
import {renderEditorialImage,editorialSvg} from '../frontend/src/lib/images/editorial';
import {GET} from '../frontend/src/pages/api/images/[locale]/[slug].png';
vi.mock('../frontend/src/lib/runtime',()=>({runtimeConfig:()=>({siteUrl:'https://tokenonair.com'})}));
vi.mock('../frontend/src/lib/content/repository',()=>({createContentRepository:()=>({getPublished:async(slug:string)=>slug==='published'?{title:'A real published headline',section:'ai',publishedAt:'2026-10-23T10:00:00Z'}:null})}));
it('renders an actual 1200 by 630 PNG without executing title markup',async()=>{
 const b=await renderEditorialImage('<script>& test headline','crypto');const m=await sharp(b).metadata();expect(m.format).toBe('png');expect([m.width,m.height]).toEqual([1200,630]);
});
it('serves published graphics and refuses invalid/missing story paths',async()=>{
 const request=async(locale:string,slug:string)=>GET({params:{locale,slug}} as never);
 expect((await request('xx','published')).status).toBe(404);
 expect((await request('en','../private')).status).toBe(404);
 expect((await request('en','missing')).status).toBe(404);
 const r=await request('en','published');expect(r.status).toBe(200);expect(r.headers.get('Content-Type')).toBe('image/png');
 expect(r.headers.get('Cache-Control')).toContain('s-maxage=300');
});

it('keeps long headlines and labels free of invalid outline coordinates',()=>{expect(editorialSvg('Ethereum postpones Hoodi Glamsterdam upgrade; replacement date unset','ai').includes('NaN')).toBe(false)});
