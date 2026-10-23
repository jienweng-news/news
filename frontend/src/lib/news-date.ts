import {languageTag,type Locale} from './i18n';
export function publicationTime(value:string,locale:Locale){
 return new Intl.DateTimeFormat(languageTag[locale],{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'UTC'}).format(new Date(value))+' UTC';
}
