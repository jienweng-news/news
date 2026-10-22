import { defineField, defineType, type SlugIsUniqueValidator } from 'sanity';
import { normalizeArticle, object, text } from '../../frontend/src/lib/content/normalize';
export function validateArticleDocument(value: unknown): true | string {
  try {
    const a = object(value); const ref = object(a.author); text(ref._ref);
    const mainImage = a.mainImage ? object(a.mainImage) : undefined;
    if (mainImage) text(object(mainImage.asset)._ref);
    normalizeArticle({ ...a, id: 'schema-validation', slug: object(a.slug).current, author: { name: 'Reference checked', slug: 'reference-checked' },
      media: mainImage ? { url: 'https://example.invalid/image', alt: mainImage.alt, credit: mainImage.credit, license: mainImage.license } : undefined });
    return true;
  } catch { return 'Complete required content, valid dates, evidence, disclosure and media rights before publishing.'; }
}
export const isUniqueArticleSlug: SlugIsUniqueValidator = async (slug, context) => {
  const id = context.document?._id?.replace(/^drafts\./, '') || '';
  const count = await context.getClient({ apiVersion: '2026-10-22' }).fetch<number>(
    'count(*[_type == "article" && slug.current == $slug && !(_id in [$publishedId, $draftId]) && !(_id in path("versions.**"))])',
    { slug, publishedId: id, draftId: `drafts.${id}` },
  );
  return count === 0;
};
export default defineType({
  name: 'article', title: 'Articles', type: 'document',
  validation: rule => rule.custom(validateArticleDocument),
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.required().max(200) }),
    defineField({ name: 'summary', type: 'text', rows: 3, validation: r => r.required().max(500) }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title', isUnique: isUniqueArticleSlug }, validation: r => r.required() }),
    defineField({ name: 'section', type: 'string', options: { list: ['ai', 'crypto'] }, validation: r => r.required() }),
    defineField({ name: 'format', type: 'string', options: { list: ['news','analysis','guide','review','announcement'] }, initialValue: 'news', validation: r => r.required() }),
    defineField({ name: 'author', type: 'reference', to: [{ type: 'author' }], validation: r => r.required() }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' },{ title: 'Heading', value: 'h2' },{ title: 'Subheading', value: 'h3' },{ title: 'Quote', value: 'blockquote' }], marks: { decorators: [{ title: 'Bold', value: 'strong' },{ title: 'Italic', value: 'em' },{ title: 'Code', value: 'code' }], annotations: [{ name: 'link', type: 'object', fields: [{ name: 'href', type: 'url', validation: r => r.required().uri({ scheme: ['http','https'] }) }] }] } }], validation: r => r.required().min(1) }),
    defineField({ name: 'publishedAt', type: 'datetime', description: 'Preserve first publication time when correcting.', validation: r => r.required() }),
    defineField({ name: 'updatedAt', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'language', type: 'string', initialValue: 'en', validation: r => r.required() }),
    defineField({ name: 'sources', type: 'array', of: [{ type: 'url', validation: r => r.uri({ scheme: ['http','https'] }) }] }),
    defineField({ name: 'mainImage', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string' },{ name: 'credit', type: 'string' },{ name: 'license', type: 'string' }] }),
    defineField({ name: 'relationship', type: 'string', initialValue: 'none', options: { list: ['none','affiliate','sponsored','owned-project'] }, validation: r => r.required() }),
    defineField({ name: 'disclosure', type: 'text', rows: 2 }),
    defineField({ name: 'corrections', type: 'array', of: [{ type: 'object', fields: [{ name: 'date', type: 'datetime', validation: r => r.required() },{ name: 'note', type: 'text', validation: r => r.required() }] }] }),
  ],
  preview: { select: { title: 'title', subtitle: 'section', media: 'mainImage' } },
});
