import { expect, it } from 'vitest';
import { normalizeLocalizedArticle } from '../frontend/src/lib/content/localized';
import { rawArticle } from './fixtures/articles';
export function multilingual() {
  const a = rawArticle();
  const copy = (title: string, slug: string) => ({title, slug, summary: title, body:a.body});
  return {...a,translations:{en:copy('English story','english-story'),zh:copy('繁體報導','traditional-story'),zhCn:copy('简体报道','simplified-story')}};
}
it('selects language-specific copy and actual reciprocal slugs from one story',()=>{
  expect(normalizeLocalizedArticle(multilingual(),'zh')).toMatchObject({title:'繁體報導',language:'zh-Hant',slug:'traditional-story',localeSlugs:{en:'english-story',zh:'traditional-story','zh-cn':'simplified-story'}});
  expect(normalizeLocalizedArticle(multilingual(),'zh-cn').title).toBe('简体报道');
});
it('holds all editions if any translation is incomplete or unsafe',()=>{
  const a=multilingual();a.translations.zh.body=[];
  expect(()=>normalizeLocalizedArticle(a,'en')).toThrow();
  expect(()=>normalizeLocalizedArticle({...multilingual(),translations:{en:multilingual().translations.en}},'zh')).toThrow();
});
it('keeps legacy content English-only instead of masquerading as translated',()=>{
  expect(normalizeLocalizedArticle(rawArticle(),'en').language).toBe('en');
  expect(()=>normalizeLocalizedArticle(rawArticle(),'zh')).toThrow();
});
