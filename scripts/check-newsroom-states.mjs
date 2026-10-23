// Built-application integration checks. Sanity is replaced only inside isolated test child processes.
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
const article = {
  id: 'test-story', slug: 'test-story', title: 'Test-only sponsored story', summary: 'Integration fixture, not reporting.',
  section: 'ai', format: 'news', language: 'en', relationship: 'sponsored', disclosure: 'Test-only sponsor disclosure.',
  publishedAt: '2026-10-22T10:00:00Z', updatedAt: '2026-10-22T10:00:00Z',
  author: { name: 'Sample', slug: 'sample' }, sources: ['https://example.com/source'], corrections: [],
  body: [{ _type: 'block', _key: 'b', style: 'normal', children: [{ _type: 'span', _key: 's', text: 'Test body.', marks: [] }], markDefs: [] }],
  media: { url: 'https://example.com/image.jpg', alt: 'Sample image', credit: 'Test photographer', license: 'Test license attribution' },
};
if (process.argv.includes('--server')) {
  const mode = process.env.NEWSROOM_TEST_STATE;
  const source = `export function createClient(){return {fetch:async(query)=>{${mode === 'outage' ? "throw new Error('Simulated CMS outage');" : `const article=${JSON.stringify(article)};return query.includes('$slug')?article:${mode === 'empty' ? '[]' : '[article]'};`}}}}`;
  registerHooks({ resolve(specifier, context, next) {
    return specifier === '@sanity/client' ? { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true } : next(specifier, context);
  } });
  await import('../frontend/dist/server/entry.mjs');
} else {
  const port = process.env.NEWSROOM_TEST_PORT || '4335';
  const base = `http://127.0.0.1:${port}`;
  const failures = [];
  for (const mode of ['content', 'empty', 'outage']) {
    const child = spawn(process.execPath, [new URL(import.meta.url).pathname, '--server'], {
      env: { ...process.env, PORT: port, HOST: '127.0.0.1', APP_ENV: 'local', CONTENT_MODE: 'sanity', SANITY_PROJECT_ID: 'testproject', SANITY_DATASET: 'production', NEWSROOM_TEST_STATE: mode },
      stdio: 'ignore',
    });
    try {
      let ready = false;
      for (let attempt = 0; attempt < 80; attempt++) {
        if (child.exitCode !== null) throw new Error('Test child exited before startup');
        try { await fetch(base); ready = true; break; } catch { await delay(50); }
      }
      assert.ok(ready, 'Test child must start');
      for (const path of ['/', '/ai/', '/crypto/']) {
        const response = await fetch(base + path); const html = await response.text();
        assert.equal(response.status, mode === 'outage' ? 503 : 200, `${mode} ${path} status`);
        if(path==='/'&&mode!=='outage')assert.match(response.headers.get('cache-control'),/s-maxage=30/);else assert.equal(response.headers.get('cache-control'), 'no-store');
        if (mode === 'outage') {
          assert.match(html, /name="robots" content="noindex, nofollow"/);
          assert.ok(html.includes('Stories are temporarily unavailable.'));
        }
        if (mode === 'content' && path !== '/crypto/') {
          if (!html.includes('Sponsored content')) failures.push(`${path}: missing visible sponsorship label`);
          if (path === '/' && (html.includes('Test photographer') || html.includes('Test license attribution'))) failures.push('Homepage: image attribution should appear only on article details');
        }
      }
      if (mode === 'content') {
        const response = await fetch(base + '/articles/test-story'); const html = await response.text();
        assert.equal(response.status, 200, 'article detail status');
        if (!html.includes('Test photographer') || !html.includes('Test license attribution')) failures.push('Article detail: missing image credit/license');
      }
    } finally {
      child.kill(); await new Promise(resolve => child.once('exit', resolve));
    }
  }
  assert.deepEqual(failures, [], 'Newsroom attribution and commercial labels');
  console.log('Built newsroom states pass: empty200, outage503/noindex/no-store, licensed-image attribution and sponsored listings. No live CMS used.');
}
