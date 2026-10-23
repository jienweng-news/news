import {expect,it} from 'vitest';
import {readFile} from 'node:fs/promises';
import {parse} from '@astrojs/compiler-rs';
it('keeps linked image attribution outside story links',async()=>{
 for(const file of ['HomePage','StoryList','ArticleBody']){
  const {ast}=await parse(await readFile(`frontend/src/components/${file}.astro`,'utf8'));
  function visit(node:any,insideLink=false){
   if(!node||typeof node!=='object')return;
   const name=node.openingElement?.name?.name;
   if(name==='ImageCredit')expect(insideLink,`${file} nests image attribution within a link`).toBe(false);
   for(const value of Object.values(node)){if(Array.isArray(value))for(const child of value)visit(child,insideLink||name==='a');else if(value&&typeof value==='object')visit(value,insideLink||name==='a');}
  }
  visit(ast);
 }
});
it('removes the footer editor credit while retaining its privacy controls and policy navigation',async()=>{
 const text=await readFile('frontend/src/layouts/BaseLayout.astro','utf8');const footer=text.slice(text.indexOf('<footer'),text.indexOf('</footer>'));
 expect(footer).not.toContain('jienweng');expect(footer).toContain('footer-statement');expect(footer).toContain('<Analytics');expect(footer).toContain('footer-policies');
});
