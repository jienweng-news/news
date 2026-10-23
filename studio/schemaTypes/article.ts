import {slugCollisionQuery} from '../../frontend/src/lib/content/slugs';
import { normalizeLocalizedArticle } from '../../frontend/src/lib/content/localized';
import { defineField, defineType, type SlugIsUniqueValidator } from 'sanity';
import { normalizeArticle, object, text } from '../../frontend/src/lib/content/normalize';
export function validateArticleDocument(value: unknown): true | string {
  try {
    const a = object(value); const ref = object(a.author); text(ref._ref);
    const mainImage = a.mainImage ? object(a.mainImage) : undefined;
    if (mainImage) text(object(mainImage.asset)._ref);
    normalizeLocalizedArticle({ ...a, id: 'schema-validation', slug: a.slug ? object(a.slug).current : undefined, author: { name: 'Reference checked', slug: 'reference-checked' },
      media: mainImage ? { url: 'https://example.invalid/image', alt: mainImage.alt, credit: mainImage.credit, license: mainImage.license } : undefined });
    return true;
  } catch { return 'Complete required content, valid dates, evidence, disclosure and media rights before publishing.'; }
}
export async function isUniqueLocalizedSlug(slug:string,context:Parameters<SlugIsUniqueValidator>[1],localeKey:string):Promise<boolean>{
  if(!['en','zh','zhCn'].includes(localeKey))return false;
  const id=context.document?._id?.replace(/^drafts\./,'')||'';
  const count=await context.getClient({apiVersion:'2026-10-22'}).fetch<number>(slugCollisionQuery,{slug,localeKey,publishedId:id,draftId:`drafts.${id}`});
  return count===0;
}
export const isUniqueArticleSlug:SlugIsUniqueValidator=(slug,context)=>isUniqueLocalizedSlug(slug,context,'en');
const bodyField = defineField({ name: 'body', type: 'array', of: [{ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' },{ title: 'Heading', value: 'h2' },{ title: 'Subheading', value: 'h3' },{ title: 'Quote', value: 'blockquote' }], marks: { decorators: [{ title: 'Bold', value: 'strong' },{ title: 'Italic', value: 'em' },{ title: 'Code', value: 'code' }], annotations: [{ name: 'link', type: 'object', fields: [{ name: 'href', type: 'url', validation: r => r.required().uri({ scheme: ['http','https'] }) }] }] } }], validation: r => r.min(1) });
export default defineType({
  name: 'article', title: 'Articles', type: 'document',
  validation: rule => rule.custom(validateArticleDocument),
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.max(200) }),
    defineField({ name: 'summary', type: 'text', rows: 3, validation: r => r.max(500) }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title', isUnique: isUniqueArticleSlug } }),
    defineField({ name: 'translations', title: 'Three-language editions', type: 'object', fields: ['en','zh','zhCn'].map(key => ({name:key,type:'object',fields:[{name:'title',type:'string'},{name:'summary',type:'text'},{name:'slug',type:'slug',options:{source:`translations.${key}.title`,isUnique:(slug:string,context:Parameters<SlugIsUniqueValidator>[1])=>isUniqueLocalizedSlug(slug,context,key)}},bodyField,{name:'disclosure',type:'text'}]})) }),
    defineField({name:'publicationState',type:'string',initialValue:'published',options:{list:['published','withdrawn']}}),
    defineField({name:'automation',type:'object',readOnly:true,hidden:true,fields:[{name:'jobId',type:'string'},{name:'candidateHash',type:'string'}]}),
    defineField({ name: 'section', type: 'string', options: { list: ['ai', 'crypto'] }, validation: r => r.required() }),
    defineField({ name: 'format', type: 'string', options: { list: ['news','analysis','guide','review','announcement'] }, initialValue: 'news', validation: r => r.required() }),
    defineField({ name: 'author', type: 'reference', to: [{ type: 'author' }], validation: r => r.required() }),
    bodyField,
    defineField({ name: 'publishedAt', type: 'datetime', description: 'Preserve first publication time when correcting.', validation: r => r.required() }),
    defineField({name:'provenance',title:'Discovery provenance',type:'object',readOnly:true,fields:[{name:'sourceUrl',type:'url'},{name:'sourcePublishedAt',type:'datetime'},{name:'discoveredAt',type:'datetime'},{name:'importedAt',type:'datetime'}]}),
    defineField({ name: 'updatedAt', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'language', type: 'string', initialValue: 'en', validation: r => r.required() }),
    defineField({ name: 'sources', type: 'array', of: [{ type: 'url', validation: r => r.uri({ scheme: ['http','https'] }) }] }),
    defineField({ name: 'mainImage', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string' },{ name: 'credit', type: 'string' },{ name: 'license', type: 'string' },{name:'sourceUrl',type:'url'},{name:'licenseUrl',type:'url'},{name:'generatedVersion',type:'string',readOnly:true,hidden:true},{name:'generatedBy',type:'string',readOnly:true,hidden:true},{name:'generatedTitle',type:'string',readOnly:true,hidden:true},{name:'generatedAssetId',type:'string',readOnly:true,hidden:true}] }),
    defineField({ name: 'relationship', type: 'string', initialValue: 'none', options: { list: ['none','affiliate','sponsored','owned-project'] }, validation: r => r.required() }),
    defineField({ name: 'disclosure', type: 'text', rows: 2 }),
    defineField({ name: 'corrections', type: 'array', of: [{ type: 'object', fields: [{ name: 'date', type: 'datetime', validation: r => r.required() },{ name: 'note', type: 'text' },{name:'notes',type:'object',fields:[{name:'en',type:'text'},{name:'zh',type:'text'},{name:'zhCn',type:'text'}]}] }] }),
  ],
  preview: { select: { title: 'title', subtitle: 'section', media: 'mainImage' } },
});
