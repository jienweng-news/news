import {expect,it} from 'vitest';
import {paginateNews,relatedStories,authorStories} from '../frontend/src/lib/content/newsroom';
import {buildFeed} from '../frontend/src/lib/discovery';
import {normalizeArticle} from '../frontend/src/lib/content/normalize';
import {rawArticle} from './fixtures/articles';
const story=(id:string,section:'ai'|'crypto'='ai')=>normalizeArticle(rawArticle({id,slug:id,section,author:{name:'jienweng',slug:'jienweng'}}));
it('paginates published items in stable newest-first order without mutating input',()=>{
 const cards=Array.from({length:13},(_,i)=>story(`story-${String(13-i).padStart(2,'0')}`));const original=cards.map(a=>a.id);
 const first=paginateNews(cards,'1')!;const second=paginateNews(cards,'2')!;
 expect(first.items).toHaveLength(12);expect(second.items.map(a=>a.id)).toEqual(['story-13']);expect(first.totalPages).toBe(2);expect(new Set([...first.items,...second.items].map(a=>a.id)).size).toBe(13);expect(cards.map(a=>a.id)).toEqual(original);
});
it('returns an empty first page but rejects malformed and out-of-range archive paths',()=>{
 expect(paginateNews([],'1')?.items).toEqual([]);
 for(const page of ['0','01','-1','1.5','abc','9007199254740992','2'])expect(paginateNews([],page)).toBeNull();
 expect(paginateNews([{...story('draft'),previewOnly:true}],'1')?.items).toEqual([]);
});
it('related stories exclude self and drafts, prefer the same section and cap at three',()=>{
 const article=story('current');const result=relatedStories([article,story('crypto','crypto'),story('a'),story('b'),story('c'),{...story('draft'),previewOnly:true}],article);
 expect(result.map(a=>a.id)).toEqual(['a','b','c']);
});
it('author pages use only matching published work and expose no synthetic biography',()=>{
 const a=story('one');expect(authorStories([a,{...story('two'),author:{name:'Other',slug:'other'}},{...story('draft'),previewOnly:true}],'jienweng').map(a=>a.id)).toEqual(['one']);
 expect(authorStories([a],'missing')).toEqual([]);expect(a.author.bio).toBeUndefined();
});
it('section feeds filter items and identify their own feed URL',()=>{
 const xml=buildFeed([story('ai-story'),story('crypto-story','crypto')],'zh','https://tokenonair.com','ai');
 expect(xml).toContain('https://tokenonair.com/zh/ai/rss.xml');expect(xml).toContain('/zh/articles/ai-story/');expect(xml).not.toContain('crypto-story');
});
