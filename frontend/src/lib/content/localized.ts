import { locales, localeKey, languageTag, type Locale } from '../i18n';
import { normalizeArticle, object, text, InvalidArticleError } from './normalize';
import type { Article } from './types';
export function normalizeLocalizedArticle(raw:unknown,locale:Locale='en',mode:'published'|'preview'='published'):Article {
  const a=object(raw);
  if(!a.translations){if(locale!=='en')throw new InvalidArticleError();return {...normalizeArticle(a,mode),localeSlugs:{en:typeof a.slug==='string'?a.slug:''}};}
  if(new TextEncoder().encode(JSON.stringify(a)).length>900000)throw new InvalidArticleError();
  const copies=object(a.translations);const articles={} as Record<Locale,Article>;
  for(const variant of locales){
    const copy=object(copies[localeKey[variant]]); const title=text(copy.title),summary=text(copy.summary);
    if(title.length>200||summary.length>500)throw new InvalidArticleError();
    const corrections=Array.isArray(a.corrections)?a.corrections.map(c=>{const row=object(c);return {...row,note:object(row.notes)[localeKey[variant]]};}):a.corrections;
    articles[variant]=normalizeArticle({...a,...copy,title,summary,slug:typeof copy.slug==='string'?copy.slug:object(copy.slug).current,language:languageTag[variant],corrections},mode);
  }
  const localeSlugs=Object.fromEntries(locales.map(l=>[l,articles[l].slug]));
  return {...articles[locale],localeSlugs};
}
