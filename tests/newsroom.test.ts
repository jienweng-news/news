import { expect, it } from 'vitest';
import { composeNewsroom, selectSection } from '../frontend/src/lib/content/newsroom';
import { normalizeArticle } from '../frontend/src/lib/content/normalize';
import { fixtureArticles } from '../frontend/src/lib/content/fixtures';
const ai = normalizeArticle(fixtureArticles[0]);
const crypto = { ...normalizeArticle(fixtureArticles[1]), publishedAt: '2026-10-22T12:00:00Z' };
it('orders the newsroom by publication time without mutating repository input', () => {
  const input = [ai, crypto];
  const result = composeNewsroom(input);
  expect(result.lead?.slug).toBe('understanding-wallet-custody');
  expect(result.latest.map(a => a.slug)).toEqual(['evaluating-ai-tools']);
  expect(input.map(a => a.slug)).toEqual(['evaluating-ai-tools', 'understanding-wallet-custody']);
});
it('keeps both sections present and isolates their articles', () => {
  expect(selectSection([crypto, ai], 'ai').map(a => a.slug)).toEqual(['evaluating-ai-tools']);
  expect(selectSection([crypto, ai], 'crypto').map(a => a.slug)).toEqual(['understanding-wallet-custody']);
  expect(composeNewsroom([ai]).sections.crypto).toEqual([]);
  expect(Object.keys(composeNewsroom([]).sections)).toEqual(['ai', 'crypto']);
});
it('never promotes preview-only cards and selects analysis without substituting guides', () => {
  const draft = { ...ai, previewOnly: true, slug: 'secret' };
  const analysis = { ...crypto, format: 'analysis' as const };
  expect(composeNewsroom([draft]).lead).toBeUndefined();
  expect(selectSection([draft], 'ai')).toEqual([]);
  expect(composeNewsroom([ai, analysis]).analysis.map(a => a.slug)).toEqual(['understanding-wallet-custody']);
  expect(composeNewsroom([])).toMatchObject({ latest: [], analysis: [] });
});
