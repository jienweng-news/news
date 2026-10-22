import type { ArticleCard, Section } from './types';

function publishedNewestFirst(articles: ArticleCard[]): ArticleCard[] {
  return articles.filter(article => !article.previewOnly)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
export function selectSection(articles: ArticleCard[], section: Section): ArticleCard[] {
  return publishedNewestFirst(articles).filter(article => article.section === section);
}
export function composeNewsroom(articles: ArticleCard[]) {
  const sorted = publishedNewestFirst(articles);
  return {
    lead: sorted[0], latest: sorted.slice(1, 7),
    sections: { ai: selectSection(sorted, 'ai'), crypto: selectSection(sorted, 'crypto') },
    analysis: sorted.filter(article => article.format === 'analysis').slice(0, 3),
  };
}
