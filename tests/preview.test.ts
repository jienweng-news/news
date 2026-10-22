import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPreviewSession, verifyPreviewSession } from '../frontend/src/lib/preview/session';
import { handlePreviewLogin, handlePreviewLogout, loadPreviewArticle, PreviewLimiter, withPreviewHeaders } from '../frontend/src/lib/preview/http';
import { readConfig } from '../frontend/src/lib/config';
import { normalizeArticle } from '../frontend/src/lib/content/normalize';
import { rawArticle } from './fixtures/articles';
const secret = 'test-only-signing-value-not-production-123456';
const key = 'test-only-access-value-not-production-123456';
const now = Date.parse('2026-10-22T00:00:00Z');
const config = () => readConfig({ PREVIEW_ACCESS_KEY: key, PREVIEW_SIGNING_SECRET: secret });
const login = (value = key, origin = 'http://localhost:4321') => new Request('http://localhost:4321/api/preview/session', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ key: value }) });
describe('signed preview sessions', () => {
  it('expires after exactly fifteen minutes', async () => {
    const value = await createPreviewSession(secret, now);
    expect(await verifyPreviewSession(value, secret, now + 899999)).toBe(true);
    expect(await verifyPreviewSession(value, secret, now + 900000)).toBe(false);
  });
  it('rejects malformed, tampered, wrong-key and future sessions', async () => {
    const value = await createPreviewSession(secret, now);
    expect(await verifyPreviewSession(value + 'x', secret, now)).toBe(false);
    expect(await verifyPreviewSession('invalid', secret, now)).toBe(false);
    expect(await verifyPreviewSession(value, key, now)).toBe(false);
    expect(await verifyPreviewSession(value, secret, now - 1)).toBe(false);
  });
});
describe('preview HTTP boundary', () => {
  let limiter: PreviewLimiter;
  beforeEach(() => { limiter = new PreviewLimiter(); });
  it('creates an HttpOnly Strict session without echoing the key', async () => {
    const response = await handlePreviewLogin(login(), config(), now, limiter);
    expect(response.status).toBe(303); expect(response.headers.get('set-cookie')).toMatch(/HttpOnly/);
    expect(response.headers.get('set-cookie')).toMatch(/SameSite=Strict/);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.text()).not.toContain(key);
  });
  it('rejects cross-origin, missing-secret and non-local requests', async () => {
    expect((await handlePreviewLogin(login(key, 'https://evil.example'), config(), now, limiter)).status).toBe(403);
    expect((await handlePreviewLogin(login(), readConfig({}), now, limiter)).status).toBe(404);
    const remote = new Request('https://news.example/api/preview/session', { method: 'POST', headers: { Origin: 'https://news.example', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ key }) });
    expect((await handlePreviewLogin(remote, config(), now, limiter)).status).toBe(404);
  });
  it('rejects large bodies and rate-limits repeated failures locally', async () => {
    expect((await handlePreviewLogin(login('x'.repeat(5000)), config(), now, limiter)).status).toBe(413);
    for (let i=0;i<5;i++) expect((await handlePreviewLogin(login('wrong'),config(),now,limiter)).status).toBe(401);
    expect((await handlePreviewLogin(login(),config(),now,limiter)).status).toBe(429);
    expect((await handlePreviewLogin(login(),config(),now+300001,limiter)).status).toBe(303);
  });
  it('never fetches a draft before authenticating and labels preview results', async () => {
    const getPreview = vi.fn().mockResolvedValue(normalizeArticle(rawArticle({id:'drafts.example'}),'preview'));
    const request = new Request('http://localhost:4321/preview/articles/example/');
    expect((await loadPreviewArticle(request, config(), 'example', getPreview, now)).status).toBe(401);
    expect(getPreview).not.toHaveBeenCalled();
    const cookie = await createPreviewSession(secret, now);
    const authenticated = new Request(request, { headers: { Cookie: `news_preview=${cookie}` } });
    expect((await loadPreviewArticle(authenticated, config(), 'example', getPreview, now)).article?.previewOnly).toBe(true);
  });
  it('clears cookies on same-origin logout and rejects cross-origin logout', async () => {
    const request = new Request('http://localhost:4321/api/preview/logout', { method:'POST', headers:{ Origin:'http://localhost:4321' } });
    const response = await handlePreviewLogout(request, config());
    expect(response.status).toBe(303); expect(response.headers.get('set-cookie')).toMatch(/Max-Age=0/);
    expect((await handlePreviewLogout(new Request(request, { headers:{Origin:'https://evil.example'}}),config())).status).toBe(403);
  });
  it.each([401,403,404,413,429,503])('applies no-store and noindex even to error %s', status => {
    const response = withPreviewHeaders(new Response('Error', {status}));
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});

describe('application origin guard', () => {
  it('rejects unsafe cross-origin requests before rendering, allowing server webhooks without Origin', async () => {
    const { crossOriginSubmission } = await import('../frontend/src/lib/preview/http');
    expect(crossOriginSubmission(new Request('https://news.example/api/write',{method:'POST',headers:{Origin:'https://evil.example'}}))).toBe(true);
    expect(crossOriginSubmission(new Request('https://news.example/api/write',{method:'POST',headers:{Origin:'https://news.example','Sec-Fetch-Site':'cross-site'}}))).toBe(true);
    expect(crossOriginSubmission(new Request('https://news.example/api/write',{method:'POST',headers:{Origin:'https://news.example'}}))).toBe(false);
    expect(crossOriginSubmission(new Request('https://news.example/api/hook',{method:'POST'}))).toBe(false);
    expect(crossOriginSubmission(new Request('https://news.example/',{headers:{Origin:'https://elsewhere.example'}}))).toBe(false);
  });
});
