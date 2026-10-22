import {expect,it} from 'vitest';
import {buildFeed,buildSitemap,searchArticles} from '../frontend/src/lib/discovery';
import {normalizeArticle} from '../frontend/src/lib/content/normalize';
import {rawArticle} from './fixtures/articles';
const card=normalizeArticle(rawArticle({title:'<script> & robots',summary:'A < B & C',localeSlugs:{en:'english',zh:'traditional'}}));
it('escapes RSS text and emits actual locale URLs without drafts',()=>{
 const xml=buildFeed([card,{...card,previewOnly:true,slug:'secret'}],'zh','https://tokenonair.com');
 expect(xml).toContain('&lt;script&gt; &amp; robots');expect(xml).not.toContain('<script>');expect(xml).toContain('/zh/articles/evaluating-ai-tools/');expect(xml).not.toContain('secret');
});
it('searches title/summary with bounded empty input and no previews',()=>{
 expect(searchArticles([card],'robots').length).toBe(1);expect(searchArticles([card],'')).toEqual([]);expect(searchArticles([card],'x'.repeat(101))).toEqual([]);expect(searchArticles([{...card,previewOnly:true}],'robots')).toEqual([]);
});
it('emits sitemap alternate URLs using per-edition slugs',()=>{
 const xml=buildSitemap({...{en:[],zh:[],'zh-cn':[]},en:[{...card,localeSlugs:{en:'english',zh:'traditional'}}]},'https://tokenonair.com');
 expect(xml).toContain('/en/articles/english/');expect(xml).toContain('/zh/articles/traditional/');expect(xml).not.toContain('drafts.');
});
