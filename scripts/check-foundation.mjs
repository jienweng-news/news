import assert from 'node:assert/strict';
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4321';
const page = async (path, options) => { const response = await fetch(new URL(path, base), options); return { response, html: await response.text() }; };
const home = await page('/');
assert.equal(home.response.status, 200, 'home must render');
assert.match(home.html, /Development sample/);
for (const slug of ['evaluating-ai-tools', 'understanding-wallet-custody']) {
  const { response, html } = await page(`/articles/${slug}/`);
  assert.equal(response.status, 200); assert.match(html, /data-article-body/); assert.match(html, /Development sample/);
  assert.match(html, /<time[^>]+datetime=/); assert.match(html, /data-article-author/);
  assert.doesNotMatch(html, /plausible\.io\/js|googletagmanager|private-test-token/);
  assert.match(html, /not current reporting/);
}
assert.equal((await page('/articles/missing/')).response.status, 404);
assert.equal((await page('/articles/unpublished-example/')).response.status, 404);
assert.equal((await page('/404/')).response.status, 404);
console.log('Public HTTP smoke: homepage, AI/Crypto article HTML, labels, dates, author, no trackers, and draft/missing 404 pass.');
