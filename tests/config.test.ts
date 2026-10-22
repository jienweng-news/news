import { describe, expect, it } from 'vitest';
import { readConfig } from '../frontend/src/lib/config';
const live = { CONTENT_MODE: 'sanity', SANITY_PROJECT_ID: 'testproject', SANITY_DATASET: 'production', SITE_URL: 'https://news.example' };
describe('deployment configuration', () => {
  it('defaults to labelled local fixtures with preview disabled', () => {
    expect(readConfig({})).toMatchObject({ appEnv: 'local', contentMode: 'fixture', siteName: 'Token on Air', previewEnabled: false });
  });
  it.each([{ APP_ENV: 'production' }, { VERCEL_ENV: 'production', APP_ENV: 'local' }, { VERCEL_ENV: 'preview' }])('rejects fixtures on deployed environments: %j', (env) => {
    expect(() => readConfig(env)).toThrow(/fixture/i);
  });
  it('rejects non-HTTPS production origins', () => {
    expect(() => readConfig({ ...live, APP_ENV: 'production', SITE_URL: 'http://news.example' })).toThrow(/https/i);
  });
  it('requires Sanity IDs', () => { expect(() => readConfig({ CONTENT_MODE: 'sanity' })).toThrow(/Sanity/i); });
  it('disables preview remotely even with secrets until durable limiting exists', () => {
    expect(readConfig({ ...live, APP_ENV: 'production', PREVIEW_ACCESS_KEY: 'a'.repeat(32), PREVIEW_SIGNING_SECRET: 's'.repeat(32) }).previewEnabled).toBe(false);
  });
  it('rejects invalid env enums and non-origin site URLs', () => {
    expect(() => readConfig({ APP_ENV: 'prod' })).toThrow();
    expect(() => readConfig({ SITE_URL: 'https://user:pass@news.example/path' })).toThrow();
  });
  it('requires long local preview secrets', () => {
    expect(readConfig({ PREVIEW_ACCESS_KEY: 'short', PREVIEW_SIGNING_SECRET: 'short' }).previewEnabled).toBe(false);
  });
});
