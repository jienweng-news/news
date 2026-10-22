import { describe, expect, it, vi } from 'vitest';
import { schemaTypes } from '../studio/schemaTypes';
import { validateArticleDocument, isUniqueArticleSlug } from '../studio/schemaTypes/article';
import { rawArticle } from './fixtures/articles';
const doc = (overrides: Record<string, unknown> = {}) => ({ ...rawArticle(), _id: 'article1', author: { _type: 'reference', _ref: 'author1' }, slug: { current: 'evaluating-ai-tools' }, ...overrides });
describe('Studio publishing requirements', () => {
  it('registers all seven public editorial document types', () => {
    expect(schemaTypes.map(s => s.name).sort()).toEqual(['article','author','category','affiliateOffer','campaign','project','siteSettings'].sort());
  });
  it('aligns fields with the renderer contract', () => {
    const article = schemaTypes.find(s => s.name === 'article')!;
    expect(article.fields.map(f => f.name)).toEqual(expect.arrayContaining(['title','summary','slug','author','section','format','body','publishedAt','updatedAt','language','sources','relationship','disclosure','corrections','mainImage']));
  });
  it('accepts a complete article', () => { expect(validateArticleDocument(doc())).toBe(true); });
  it.each([{ title: '' },{ summary: '' },{ slug: undefined },{ author: undefined },{ body: [] },{ section: '' },{ publishedAt: '' },{ updatedAt: 'yesterday' },{ relationship: 'affiliate' },{ format: 'news', sources: [] },{ mainImage: { asset: { _ref: 'image-x' }, alt: 'Photo' } }])('rejects incomplete documents %j', bad => {
    expect(validateArticleDocument(doc(bad))).not.toBe(true);
  });
  it('ignores draft/published sibling IDs when checking unique slugs', async () => {
    const fetch = vi.fn().mockResolvedValue(0); const context = { document: { _id: 'drafts.article1' }, getClient: () => ({ fetch }) };
    expect(await isUniqueArticleSlug('evaluating-ai-tools', context)).toBe(true);
    expect(fetch.mock.calls[0][1]).toEqual({ slug: 'evaluating-ai-tools', localeKey:'en', publishedId: 'article1', draftId: 'drafts.article1' });
    fetch.mockResolvedValue(1); expect(await isUniqueArticleSlug('evaluating-ai-tools', context)).toBe(false);
  });
  it('contains no private contract or subscriber fields', () => {
    const names = schemaTypes.flatMap(s => s.fields.map(f => f.name));
    expect(names).not.toContain('subscriberEmail'); expect(names).not.toContain('contract'); expect(names).not.toContain('commissionRate');
  });
});
it('checks legacy and translated English slugs through a common locale-aware validator',async()=>{
 const {isUniqueLocalizedSlug}=await import('../studio/schemaTypes/article');const fetch=vi.fn().mockResolvedValue(1);const context={document:{_id:'drafts.article1'},getClient:()=>({fetch})};
 expect(await isUniqueLocalizedSlug('story',context as any,'en')).toBe(false);expect(fetch.mock.calls[0][0]).toContain('translations[$localeKey].slug.current');expect(fetch.mock.calls[0][0]).toContain('!defined(translations)');expect(fetch.mock.calls[0][1]).toMatchObject({localeKey:'en',slug:'story',publishedId:'article1',draftId:'drafts.article1'});
});
