import { createClient } from '@sanity/client';
import type { AppConfig } from '../config';
const projection = `{ "id": _id, "slug": slug.current, title, summary, section, format, body, "author": author->{name, "slug": slug.current, bio, "image": select(defined(image.asset) => {"url": image.asset->url, "alt": image.alt})}, publishedAt, updatedAt, language, publicationState, translations, sources, corrections, relationship, disclosure, "media": select(defined(mainImage.asset) => {"url": mainImage.asset->url, "alt": mainImage.alt, "credit": mainImage.credit, "license": mainImage.license}) }`;
const published = `_type == "article" && (!defined(publicationState) || publicationState == "published") && !(_id in path("drafts.**")) && !(_id in path("versions.**"))`;
export const listQuery = `*[${published}] | order(publishedAt desc) ${projection}`;
export const articleQuery = `*[${published} && (slug.current == $slug || translations[$localeKey].slug.current == $slug)][0] ${projection}`;
export const previewQuery = `*[_type == "article" && (slug.current == $slug || translations[$localeKey].slug.current == $slug)][0] ${projection}`;
export function publicClient(config: AppConfig) {
  return createClient({ projectId: config.sanityProjectId!, dataset: config.sanityDataset!, apiVersion: '2026-10-22', perspective: 'published', useCdn: false, timeout: 8000, maxRetries: 1 });
}
export function previewClient(config: AppConfig) {
  if (!config.sanityReadToken) throw new Error('Preview reader not configured');
  return createClient({ projectId: config.sanityProjectId!, dataset: config.sanityDataset!, apiVersion: '2026-10-22', perspective: 'drafts', useCdn: false, token: config.sanityReadToken, timeout: 8000, maxRetries: 1 });
}
