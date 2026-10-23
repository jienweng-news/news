import {expect,it} from 'vitest';
import {responsiveImage} from '../frontend/src/lib/images/delivery';

it('serves Sanity images in modern formats at responsive display widths',()=>{
 const image=responsiveImage('https://cdn.sanity.io/images/4k0o7q9m/production/asset-1200x630.png',810);
 expect(image.src).toContain('auto=format');
 expect(image.src).toContain('w=960');
 expect(image.srcset).toContain('w=480 480w');
 expect(image.srcset).toContain('w=960 960w');
 expect(image.sizes).toBe('(max-width: 850px) calc(100vw - 40px), 810px');
});

it('leaves non-Sanity URLs untouched and does not emit invalid srcsets',()=>{
 expect(responsiveImage('https://example.com/photo.jpg',440)).toEqual({src:'https://example.com/photo.jpg'});
 expect(responsiveImage('/api/images/en/story.png',440)).toEqual({src:'/api/images/en/story.png'});
});
