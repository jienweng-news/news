import type { Locale } from '../i18n';
export type Section = 'ai' | 'crypto';
export type Format = 'news' | 'analysis' | 'guide' | 'review' | 'announcement';
export type Relationship = 'none' | 'affiliate' | 'sponsored' | 'owned-project';
export interface BodyBlock {
  _type: 'block'; _key: string; style: string;
  children: { _type: 'span'; _key: string; text: string; marks: string[] }[];
  markDefs: { _type: 'link'; _key: string; href: string }[];
  listItem?: 'bullet' | 'number'; level?: number;
}
export interface Article {
  id: string; slug: string; title: string; summary: string; section: Section; format: Format; body: BodyBlock[];
  author: { name: string; slug: string; bio?: string }; publishedAt: string; updatedAt: string; language: string;
  sources: string[]; media?: { url: string; alt: string; credit: string; license: string };
  corrections: { date: string; note: string }[]; relationship: Relationship; disclosure?: string;
  fixture: boolean; previewOnly: boolean; localeSlugs?: Partial<Record<Locale,string>>;
}
export type ArticleCard = Omit<Article, 'body' | 'corrections'>;
export interface ContentRepository {
  listPublished(locale?: Locale): Promise<ArticleCard[]>;
  getPublished(slug: string, locale?: Locale): Promise<Article | null>;
  getPreview(slug: string, locale?: Locale): Promise<Article | null>;
}
