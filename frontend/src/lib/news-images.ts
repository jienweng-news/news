import type {ArticleCard} from './content/types';
import type {Locale} from './i18n';
export function storyImage(article:ArticleCard,locale:Locale){
 return article.media||{url:`/api/images/${locale}/${article.slug}.png`,alt:article.title,credit:'Token on Air',license:'Editorial illustration'};
}
export function shareImage(article:ArticleCard,locale:Locale,origin:string){
 const image=storyImage(article,locale);return {...image,url:new URL(image.url,origin).href};
}
export function authorImage(author:ArticleCard['author']){
 return author.image||{url:'/brand/editor-avatar.png',alt:`${author.name} — editorial avatar`};
}
export function showImageCredit(image:{credit:string}){return image.credit!=='PANews';}
export function imageCaption(article:ArticleCard){return article.media&&showImageCredit(article.media)?`${article.media.credit} · ${article.media.license}`:undefined;}
