import type { ArticleCard, Section } from './types';

function publishedNewestFirst(articles: ArticleCard[]): ArticleCard[] {
  return articles.filter(article => !article.previewOnly)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}
export function selectSection(articles: ArticleCard[], section: Section): ArticleCard[] {
  return publishedNewestFirst(articles).filter(article => article.section === section);
}
export function composeNewsroom(articles: ArticleCard[]) {
  const sorted = publishedNewestFirst(articles);
  return {
    lead: sorted[0], supporting: sorted.slice(1,3), latest: sorted.slice(1, 7),
    sections: { ai: selectSection(sorted, 'ai'), crypto: selectSection(sorted, 'crypto') },
    analysis: sorted.filter(article => article.format === 'analysis').slice(0, 3),
  };
}

export function paginateNews(articles:ArticleCard[],pageValue:string){
  if(!/^[1-9][0-9]*$/.test(pageValue))return null;
  const page=Number(pageValue);const sorted=publishedNewestFirst(articles);
  const totalPages=Math.max(1,Math.ceil(sorted.length/12));
  if(!Number.isSafeInteger(page)||page>totalPages)return null;
  return {items:sorted.slice((page-1)*12,page*12),page,totalPages};
}
export function authorStories(articles:ArticleCard[],slug:string){
  return publishedNewestFirst(articles).filter(a=>a.author.slug===slug);
}
export function relatedStories(articles:ArticleCard[],current:ArticleCard){
  const sorted=publishedNewestFirst(articles).filter(a=>a.id!==current.id);
  return [...sorted.filter(a=>a.section===current.section),...sorted.filter(a=>a.section!==current.section)].slice(0,3);
}
