import type { AppConfig } from '../config';
import type { Article, ContentRepository } from '../content/types';
import { createPreviewSession, verifyPreviewSession } from './session';
import { resolveArticlePage } from '../content/page';
export function withPreviewHeaders(response: Response): Response {
  const result = new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
  result.headers.set('Cache-Control','private, no-store');
  result.headers.set('X-Robots-Tag','noindex, nofollow');
  result.headers.set('Referrer-Policy','no-referrer');
  result.headers.set('X-Content-Type-Options','nosniff');
  return result;
}
const error = (status: number, message = 'Preview request could not be completed.') => withPreviewHeaders(new Response(message,{ status }));
export function localPreviewAllowed(request: Request, config: AppConfig): boolean {
  const rawHost=request.headers.get('host');
  const rawLocal=rawHost === null || /^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?$/i.test(rawHost);
  return config.previewEnabled && rawLocal && ['localhost','127.0.0.1','[::1]'].includes(new URL(request.url).hostname);
}
function sameOrigin(request: Request): boolean { return request.headers.get('origin') === new URL(request.url).origin; }
function cookie(value: string, request: Request, maxAge: number): string {
  return `news_preview=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export class PreviewLimiter {
  private failures = 0; private until = 0;
  blocked(now: number) { if (now >= this.until) { this.failures = 0; this.until = now + 300000; } return this.failures >= 5; }
  fail() { this.failures++; }
  reset() { this.failures = 0; }
}
export const localLimiter = new PreviewLimiter();
async function boundedBody(request: Request): Promise<string | null> {
  if (Number(request.headers.get('content-length')) > 4096) return null;
  const reader = request.body?.getReader(); if (!reader) return '';
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) { const { value, done } = await reader.read(); if (done) break; length += value.byteLength; if (length > 4096) { await reader.cancel(); return null; } chunks.push(value); }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { body.set(chunk,offset); offset += chunk.length; }
  return new TextDecoder().decode(body);
}
async function sameKey(actual: string, expected: string): Promise<boolean> {
  const encode = new TextEncoder();
  const [a,b] = await Promise.all([crypto.subtle.digest('SHA-256',encode.encode(actual)),crypto.subtle.digest('SHA-256',encode.encode(expected))]);
  const first=new Uint8Array(a), second=new Uint8Array(b); let diff=0;
  for(let i=0;i<first.length;i++) diff |= first[i]^second[i];
  return diff===0;
}
export async function handlePreviewLogin(request: Request, config: AppConfig, now = Date.now(), limiter = localLimiter): Promise<Response> {
  if (!localPreviewAllowed(request,config)) return error(404);
  if (request.method !== 'POST') return error(405);
  if (!sameOrigin(request)) return error(403);
  if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return error(415);
  if (limiter.blocked(now)) return error(429,'Too many failed attempts. Try again in five minutes.');
  let body: string | null; try { body = await boundedBody(request); } catch { return error(400); }
  if (body === null) return error(413);
  if (!await sameKey(new URLSearchParams(body).get('key') || '',config.previewAccessKey!)) { limiter.fail(); return error(401,'Preview access was not accepted. Return to the preview form and try again.'); }
  limiter.reset(); const session=await createPreviewSession(config.previewSigningSecret!,now);
  return withPreviewHeaders(new Response(null,{ status:303, headers:{ Location:'/preview/', 'Set-Cookie':cookie(session,request,900) } }));
}
export async function handlePreviewLogout(request: Request, config: AppConfig): Promise<Response> {
  if (!localPreviewAllowed(request,config)) return error(404);
  if (request.method !== 'POST') return error(405);
  if (!sameOrigin(request)) return error(403);
  return withPreviewHeaders(new Response(null,{ status:303, headers:{ Location:'/preview/', 'Set-Cookie':cookie('',request,0) } }));
}
export async function authenticatedPreview(request: Request, config: AppConfig, now=Date.now()): Promise<boolean> {
  if (!localPreviewAllowed(request,config)) return false;
  const entry=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('news_preview='));
  return !!entry && verifyPreviewSession(entry.slice('news_preview='.length),config.previewSigningSecret!,now);
}
export async function loadPreviewArticle(request: Request, config: AppConfig, slug: string, getPreview: ContentRepository['getPreview'], now=Date.now()): Promise<{ article: Article|null; status:200|401|404|503 }> {
  if (!localPreviewAllowed(request,config)) return { article:null,status:404 };
  if (!await authenticatedPreview(request,config,now)) return { article:null,status:401 };
  return resolveArticlePage(getPreview,slug);
}

// An app-wide guard replaces Astro's early form check, preserving preview headers on errors.
export function crossOriginSubmission(request: Request): boolean {
  if (['GET','HEAD','OPTIONS'].includes(request.method)) return false;
  const fetchSite=request.headers.get('sec-fetch-site');
  if (fetchSite && !['same-origin','none'].includes(fetchSite)) return true;
  const origin=request.headers.get('origin');
  return origin !== null && origin !== new URL(request.url).origin;
}
