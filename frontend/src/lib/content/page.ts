import type { Article, ContentRepository } from './types';
export async function resolveArticlePage(getArticle: ContentRepository['getPublished'], slug: string): Promise<{ article: Article | null; status: 200 | 404 | 503 }> {
  try { const article = await getArticle(slug); return { article, status: article ? 200 : 404 }; }
  catch { return { article: null, status: 503 }; }
}
