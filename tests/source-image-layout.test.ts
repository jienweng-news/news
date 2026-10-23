import {expect,it} from 'vitest';
import {readFile} from 'node:fs/promises';
it('preserves the full frame of PANews images in article, lead and list placements',async()=>{
 for(const file of ['ArticleBody','HomePage','StoryList'])expect(await readFile(`frontend/src/components/${file}.astro`,'utf8')).toContain('source-chart');
 const css=await readFile('frontend/src/styles/global.css','utf8');expect(css).toContain('source-chart');expect(css).toMatch(/source-chart[^{}]*\{[^}]*object-fit:\s*contain/s);
});
