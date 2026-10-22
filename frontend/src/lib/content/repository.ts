import { normalizeLocalizedArticle } from './localized';
import { localeKey, type Locale } from '../i18n';
import type { AppConfig } from '../config';
import type { Article, ArticleCard, ContentRepository } from './types';
import { validSlug } from './normalize';
import { fixtureArticles, fixtureDraft } from './fixtures';
import { publicClient, previewClient, listQuery, articleQuery, previewQuery } from './sanity';
export class ContentUnavailableError extends Error { constructor() { super('Editorial content is temporarily unavailable'); } }
function cards(raw: unknown, locale:Locale='en'): ArticleCard[] {
  if (!Array.isArray(raw)) throw new ContentUnavailableError();
  return raw.flatMap(item => { try { const { body: _body, corrections: _corrections, ...card } = normalizeLocalizedArticle(item,locale); return [card]; } catch { console.warn('Omitted an invalid editorial document'); return []; } });
}
export function createContentRepository(config: AppConfig): ContentRepository {
  const client = config.contentMode === 'sanity' ? publicClient(config) : undefined;
  async function fetchArticle(slug: string, preview: boolean, locale:Locale='en'): Promise<Article | null> {
    if (!validSlug(slug)) return null;
    try {
      const raw = config.contentMode === 'fixture'
        ? (preview && fixtureDraft.slug === slug ? fixtureDraft : fixtureArticles.find(a => a.slug === slug || a.translations[localeKey[locale]].slug === slug))
        : await (preview ? previewClient(config).fetch(previewQuery, { slug, localeKey:localeKey[locale] }) : client!.fetch(articleQuery, { slug, localeKey:localeKey[locale] }));
      if(!raw)return null;const article=normalizeLocalizedArticle(raw,locale,preview?'preview':'published');return article.slug===slug?article:null;
    } catch { throw new ContentUnavailableError(); }
  }
  return {
    async listPublished(locale:Locale='en') { try { return cards(config.contentMode === 'fixture' ? fixtureArticles : await client!.fetch(listQuery),locale); } catch { throw new ContentUnavailableError(); } },
    getPublished: (slug,locale) => fetchArticle(slug, false,locale),
    getPreview: (slug,locale) => fetchArticle(slug, true,locale),
  };
}
