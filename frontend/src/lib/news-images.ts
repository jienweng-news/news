import type {ArticleCard} from './content/types';
import type {Locale} from './i18n';
import {rejectedImageSources} from './images/policy';
export function storyImage(article:ArticleCard,locale:Locale){
 void locale;
 const media=article.media;
 if(!media||media.credit==='Token on Air'&&media.license.startsWith('Original editorial illustration')||media.sourceUrl&&rejectedImageSources.some(source=>source===media.sourceUrl))return undefined;
 return media;
}
export function storyThumbnail(article:ArticleCard,locale:Locale){
 return storyImage(article,locale);
}
export function shareImage(article:ArticleCard,locale:Locale,origin:string){
 const image=storyImage(article,locale);return image?{...image,url:new URL(image.url,origin).href}:undefined;
}
export function authorImage(author:ArticleCard['author']){
 return author.image||{url:'/brand/editor-avatar.png',alt:`${author.name} — editorial avatar`};
}
export function showImageCredit(image:{credit:string}){return image.credit!=='PANews';}
export function imageCaption(article:ArticleCard){return article.media&&showImageCredit(article.media)?`${article.media.credit} · ${article.media.license}`:undefined;}
