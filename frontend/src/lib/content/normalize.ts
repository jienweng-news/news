import type { Article, BodyBlock, Format, Relationship, Section } from './types';
export class InvalidArticleError extends Error { constructor() { super('Article does not meet publication requirements'); } }
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InvalidArticleError();
  return value as Record<string, unknown>;
}
export function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new InvalidArticleError();
  return value.trim();
}
export function safeUrl(value: unknown): string {
  const result = text(value); let url: URL;
  try { url = new URL(result); } catch { throw new InvalidArticleError(); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new InvalidArticleError();
  return url.href;
}
function date(value: unknown): string {
  const result = text(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(result);
  if (!match) throw new InvalidArticleError();
  const [, y, m, d, h, min, sec, zone] = match;
  const year=Number(y), month=Number(m), day=Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31,leap ? 29 : 28,31,30,31,30,31,31,30,31,30,31];
  if (month < 1 || month > 12 || day < 1 || day > days[month-1] || Number(h)>23 || Number(min)>59 || Number(sec)>59) throw new InvalidArticleError();
  if (zone !== 'Z' && (Number(zone.slice(1,3))>23 || Number(zone.slice(4,6))>59)) throw new InvalidArticleError();
  if (!Number.isFinite(Date.parse(result))) throw new InvalidArticleError();
  return new Date(result).toISOString();
}
export const validSlug = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
function slug(value: unknown): string { const result = text(value); if (!validSlug(result)) throw new InvalidArticleError(); return result; }
function body(value: unknown): BodyBlock[] {
  if (!Array.isArray(value) || !value.length || value.length > 1000) throw new InvalidArticleError();
  const blocks = value.map((v): BodyBlock => {
    const block = object(v);
    if (block._type !== 'block' || !Array.isArray(block.children) || !block.children.length) throw new InvalidArticleError();
    const defs = block.markDefs ?? [];
    if (!Array.isArray(defs)) throw new InvalidArticleError();
    const markDefs = defs.map((m) => {
      const def = object(m); if (def._type !== 'link') throw new InvalidArticleError();
      return { _type: 'link' as const, _key: text(def._key), href: safeUrl(def.href) };
    });
    const allowedMarks = new Set(['strong', 'em', 'code', 'underline', 'strike-through', ...markDefs.map(d => d._key)]);
    const children = block.children.map((c) => {
      const span = object(c);
      if (span._type !== 'span' || typeof span.text !== 'string' || !Array.isArray(span.marks) || span.marks.some(m => typeof m !== 'string' || !allowedMarks.has(m))) throw new InvalidArticleError();
      return { _type: 'span' as const, _key: text(span._key), text: span.text, marks: span.marks as string[] };
    });
    const style = block.style ?? 'normal';
    if (typeof style !== 'string' || !['normal', 'h2', 'h3', 'blockquote'].includes(style)) throw new InvalidArticleError();
    const result: BodyBlock = { _type: 'block', _key: text(block._key), style, children, markDefs };
    if (block.listItem !== undefined) {
      if (!['bullet', 'number'].includes(String(block.listItem)) || !Number.isInteger(block.level) || Number(block.level) < 1 || Number(block.level) > 6) throw new InvalidArticleError();
      result.listItem = block.listItem as 'bullet' | 'number'; result.level = Number(block.level);
    }
    return result;
  });
  if (!blocks.some(b => b.children.some(c => c.text.trim()))) throw new InvalidArticleError();
  return blocks;
}
export function normalizeArticle(raw: unknown, mode: 'published' | 'preview' = 'published'): Article {
  const a = object(raw); if(mode==='published'&&a.publicationState==='withdrawn')throw new InvalidArticleError(); const id = text(a.id);
  if (mode === 'published' && /^(drafts|versions)\./.test(id)) throw new InvalidArticleError();
  const section = text(a.section); const format = text(a.format); const relationship = text(a.relationship);
  if (!['ai', 'crypto'].includes(section) || !['news', 'analysis', 'guide', 'review', 'announcement'].includes(format) || !['none', 'affiliate', 'sponsored', 'owned-project'].includes(relationship)) throw new InvalidArticleError();
  const author = object(a.author); const sources = a.sources ?? [];
  if (!Array.isArray(sources) || (format === 'news' && sources.length === 0)) throw new InvalidArticleError();
  const disclosure = a.disclosure === undefined || a.disclosure === null ? undefined : text(a.disclosure);
  if (relationship !== 'none' && !disclosure) throw new InvalidArticleError();
  const publishedAt = date(a.publishedAt); const updatedAt = date(a.updatedAt);
  if (updatedAt < publishedAt) throw new InvalidArticleError();
  const corrections = a.corrections ?? [];
  if (!Array.isArray(corrections)) throw new InvalidArticleError();
  const result: Article = {
    id, slug: slug(a.slug), title: text(a.title), summary: text(a.summary), section: section as Section, format: format as Format,
    body: body(a.body), author: { name: text(author.name), slug: slug(author.slug), ...(author.bio ? { bio: text(author.bio) } : {}), ...(author.image ? {image: {url:safeUrl(object(author.image).url),alt:text(object(author.image).alt)}} : {}) },
    publishedAt, updatedAt, language: text(a.language), sources: sources.map(safeUrl), relationship: relationship as Relationship, disclosure,
    corrections: corrections.map(c => { const correction = object(c); return { date: date(correction.date), note: text(correction.note) }; }),
    fixture: a.fixture === true, previewOnly: mode === 'preview',
  };
  if (a.media) { const m = object(a.media); result.media = { url: safeUrl(m.url), alt: text(m.alt), credit: text(m.credit), license: text(m.license), ...(m.sourceUrl?{sourceUrl:safeUrl(m.sourceUrl)}:{}), ...(m.licenseUrl?{licenseUrl:safeUrl(m.licenseUrl)}:{}) }; }
  return result;
}
