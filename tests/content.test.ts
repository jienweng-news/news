import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rawArticle } from './fixtures/articles';
const { clientFactory, publicFetch, previewFetch } = vi.hoisted(() => ({ clientFactory: vi.fn(), publicFetch: vi.fn(), previewFetch: vi.fn() }));
vi.mock('@sanity/client', () => ({ createClient: clientFactory }));
import { readConfig } from '../frontend/src/lib/config';
import { normalizeArticle } from '../frontend/src/lib/content/normalize';
import { createContentRepository, ContentUnavailableError } from '../frontend/src/lib/content/repository';
describe('article boundary', () => {
  it('normalizes valid AI and crypto articles', () => {
    expect(normalizeArticle(rawArticle()).section).toBe('ai');
    expect(normalizeArticle(rawArticle({ section: 'crypto' })).section).toBe('crypto');
  });
  it.each([{ author: null }, { body: [] }, { publishedAt: 'yesterday' }, { updatedAt: '2025-01-01' }, { section: 'other' }, { format: 'other' }, { slug: '../preview' }, { language: '' }])('rejects invalid content %j', (bad) => {
    expect(() => normalizeArticle(rawArticle(bad))).toThrow();
  });
  it('requires source evidence for news', () => {
    expect(() => normalizeArticle(rawArticle({ format: 'news', sources: [] }))).toThrow();
  });
  it('requires commercial disclosure', () => {
    expect(() => normalizeArticle(rawArticle({ relationship: 'affiliate' }))).toThrow();
    expect(normalizeArticle(rawArticle({ relationship: 'affiliate', disclosure: 'Development example, no active affiliate relationship.' })).disclosure).toBeTruthy();
  });
  it('rejects executable URLs in sources and body annotations', () => {
    expect(() => normalizeArticle(rawArticle({ sources: ['javascript:alert(1)'] }))).toThrow();
    const body = rawArticle().body; body[0].markDefs = [{ _type: 'link', _key: 'x', href: 'javascript:alert(1)' }] as never[];
    expect(() => normalizeArticle(rawArticle({ body }))).toThrow();
  });
  it('rejects malformed author references and media without rights', () => {
    expect(() => normalizeArticle(rawArticle({ author: { _ref: 'missing' } }))).toThrow();
    expect(() => normalizeArticle(rawArticle({ media: { url: 'https://example.com/image.jpg', alt: 'Photo' } }))).toThrow();
  });
  it('rejects draft and version IDs publicly but labels preview data', () => {
    expect(() => normalizeArticle(rawArticle({ id: 'drafts.example-ai' }))).toThrow();
    expect(() => normalizeArticle(rawArticle({ id: 'versions.release.example-ai' }))).toThrow();
    expect(normalizeArticle(rawArticle({ id: 'drafts.example-ai' }), 'preview').previewOnly).toBe(true);
  });
});
describe('content repository isolation', () => {
  const config = () => readConfig({ CONTENT_MODE: 'sanity', SANITY_PROJECT_ID: 'testproject', SANITY_DATASET: 'production', SANITY_READ_TOKEN: 'private-test-token' });
  beforeEach(() => { vi.clearAllMocks(); clientFactory.mockImplementation((options) => ({ fetch: options.token ? previewFetch : publicFetch })); });
  it('uses published perspective without a privileged token for public reads', async () => {
    publicFetch.mockResolvedValue(rawArticle());
    const repository = createContentRepository(config());
    await repository.getPublished('evaluating-ai-tools');
    expect(clientFactory.mock.calls[0][0]).toMatchObject({ perspective: 'published' });
    expect(clientFactory.mock.calls[0][0].token).toBeUndefined();
    expect(publicFetch.mock.calls[0][0]).toContain('drafts.**');
    expect(previewFetch).not.toHaveBeenCalled();
  });
  it('returns null for a missing article and unavailable for upstream failure', async () => {
    const repo = createContentRepository(config());
    publicFetch.mockResolvedValue(null); expect(await repo.getPublished('missing')).toBeNull();
    publicFetch.mockRejectedValue(new Error('private-error-detail')); await expect(repo.listPublished()).rejects.toBeInstanceOf(ContentUnavailableError);
  });
  it('omits malformed public listings and rejects malformed details safely', async () => {
    const repo = createContentRepository(config());
    publicFetch.mockResolvedValue([rawArticle(), rawArticle({ author: null })]); expect(await repo.listPublished()).toHaveLength(1);
    publicFetch.mockResolvedValue(rawArticle({ author: null })); await expect(repo.getPublished('bad')).rejects.toBeInstanceOf(ContentUnavailableError);
  });
  it('creates private reader only on explicit preview access', async () => {
    previewFetch.mockResolvedValue(rawArticle({ id: 'drafts.example-ai' }));
    const repo = createContentRepository(config()); await repo.getPreview('evaluating-ai-tools');
    expect(clientFactory.mock.calls[1][0]).toMatchObject({ token: 'private-test-token', perspective: 'drafts', useCdn: false });
  });
  it('keeps fixture drafts out of public listings', async () => {
    const repo = createContentRepository(readConfig({}));
    const cards = await repo.listPublished(); expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(cards.every((a) => a.fixture && !a.previewOnly)).toBe(true);
    expect(await repo.getPublished('unpublished-example')).toBeNull();
    expect((await repo.getPreview('unpublished-example'))?.previewOnly).toBe(true);
  });
});
