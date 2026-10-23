import {expect,it} from 'vitest';
import {readFile} from 'node:fs/promises';

it('lays related stories out as image-led cards that adapt to narrower screens',async()=>{
 const css=await readFile('frontend/src/styles/global.css','utf8');
 const stories=css.match(/\.related-stories \.story-list\s*\{([^}]+)\}/)?.[1]??'';
 const thumbnails=css.match(/\.related-stories \.story-thumbnail img\s*\{([^}]+)\}/)?.[1]??'';
 const tablet=css.match(/@media\(max-width:900px\)\{\.related-stories \.story-list\{([^}]+)\}\}/)?.[1]??'';
 const mobile=css.match(/@media\(max-width:640px\)\{\.related-stories \.story-list\{([^}]+)\}/)?.[1]??'';
 expect(stories).toContain('display:grid');
 expect(stories).toContain('repeat(3,minmax(0,1fr))');
 expect(thumbnails).toContain('width:100%');
 expect(thumbnails).toContain('aspect-ratio:1200/630');
 expect(thumbnails).toContain('object-fit:cover');
 expect(tablet).toContain('repeat(2,minmax(0,1fr))');
 expect(mobile).toContain('grid-template-columns:1fr');
});
