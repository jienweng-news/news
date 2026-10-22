import type {ArticleCard} from './content/types';
import {locales,languageTag,localePath,type Locale} from './i18n';
export const xmlEscape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export function searchArticles(cards:ArticleCard[],query:string):ArticleCard[]{
 const q=query.trim().normalize('NFKC').toLocaleLowerCase();if(!q||q.length>100)return [];
 return cards.filter(a=>!a.previewOnly&&`${a.title} ${a.summary}`.normalize('NFKC').toLocaleLowerCase().includes(q)).slice(0,100);
}
export function buildFeed(cards:ArticleCard[],locale:Locale,siteUrl:string):string{
 const url=(p:string)=>xmlEscape(new URL(p,siteUrl).href);
 return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Token on Air</title><link>${url(localePath(locale))}</link><description>AI and crypto / Token on Air</description><language>${languageTag[locale]}</language><atom:link href="${url(`/${locale}/rss.xml`)}" rel="self" type="application/rss+xml"/>${cards.filter(a=>!a.previewOnly).slice(0,100).map(a=>`<item><title>${xmlEscape(a.title)}</title><link>${url(localePath(locale,`articles/${a.slug}`))}</link><guid isPermaLink="true">${url(localePath(locale,`articles/${a.slug}`))}</guid><description>${xmlEscape(a.summary+(a.relationship==='none'?'':` [${a.relationship}]`))}</description><pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`;
}
export function buildSitemap(editions:Record<Locale,ArticleCard[]>,siteUrl:string):string{
 const absolute=(path:string)=>xmlEscape(new URL(path,siteUrl).href);const urls:string[]=[];
 for(const locale of locales){
  for(const path of ['', 'ai','crypto','search','about','policy','contact','privacy','advertise'])urls.push(`<url><loc>${absolute(localePath(locale,path))}</loc></url>`);
  for(const a of editions[locale].filter(a=>!a.previewOnly)){
   const slugs=a.localeSlugs||{[locale]:a.slug};
   urls.push(`<url><loc>${absolute(localePath(locale,`articles/${slugs[locale]||a.slug}`))}</loc><lastmod>${a.updatedAt}</lastmod>${Object.entries(slugs).map(([l,slug])=>`<xhtml:link rel="alternate" hreflang="${languageTag[l as Locale]}" href="${absolute(`/${l}/articles/${slug}/`)}"/>`).join('')}</url>`);
  }
 }
 return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`;
}
