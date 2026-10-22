import type { AppConfig } from '../config';
import type { Article, ArticleCard, ContentRepository } from './types';
import { normalizeArticle, validSlug } from './normalize';
import { fixtureArticles, fixtureDraft } from './fixtures';
import { publicClient, previewClient, listQuery, articleQuery, previewQuery } from './sanity';
export class ContentUnavailableError extends Error { constructor() { super('Editorial content is temporarily unavailable'); } }
function cards(raw: unknown): ArticleCard[] {
  if (!Array.isArray(raw)) throw new ContentUnavailableError();
  return raw.flatMap(item => { try { const { body: _body, corrections: _corrections, ...card } = normalizeArticle(item); return [card]; } catch { console.warn('Omitted an invalid editorial document'); return []; } });
}
export function createContentRepository(config: AppConfig): ContentRepository {
  const client = config.contentMode === 'sanity' ? publicClient(config) : undefined;
  async function fetchArticle(slug: string, preview: boolean): Promise<Article | null> {
    if (!validSlug(slug)) return null;
    try {
      const raw = config.contentMode === 'fixture'
        ? (preview && fixtureDraft.slug === slug ? fixtureDraft : fixtureArticles.find(a => a.slug === slug))
        : await (preview ? previewClient(config).fetch(previewQuery, { slug }) : client!.fetch(articleQuery, { slug }));
      return raw ? normalizeArticle(raw, preview ? 'preview' : 'published') : null;
    } catch { throw new ContentUnavailableError(); }
  }
  return {
    async listPublished() { try { return cards(config.contentMode === 'fixture' ? fixtureArticles : await client!.fetch(listQuery)); } catch { throw new ContentUnavailableError(); } },
    getPublished: slug => fetchArticle(slug, false),
    getPreview: slug => fetchArticle(slug, true),
  };
}
