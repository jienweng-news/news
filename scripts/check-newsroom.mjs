import assert from 'node:assert/strict';
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4321';
async function page(path) {
  const response = await fetch(new URL(path, base));
  return { response, html: await response.text() };
}
const home = await page('/');
assert.equal(home.response.status, 200);
assert.match(home.html, /src="\/brand\/token-on-air-cutout.svg"/);
assert.match(home.html, /alt="Token on Air"/);
assert.match(home.html, /rel="icon"[^>]*href="\/favicon.svg"/);
for (const path of ['/brand/token-on-air-cutout.svg', '/brand/token-on-air-compact.svg', '/favicon.svg']) {
  const asset = await page(path);
  assert.equal(asset.response.status, 200, `${path} must resolve`);
  assert.match(asset.response.headers.get('content-type') || '', /image\/svg\+xml/);
  assert.match(asset.html, /<svg/);
  assert.doesNotMatch(asset.html, /<script|<text|<image/);
}

assert.match(home.html, /Token on Air/);
assert.match(home.html, /Understand what’s next\./);
assert.match(home.html, /aria-label="Main navigation"/);
assert.match(home.html, /href="\/en\/ai\/"/);
assert.match(home.html, /href="\/en\/crypto\/"/);
assert.match(home.html, /Development sample/);
assert.match(home.html, /name="robots" content="noindex, nofollow"/);
for (const [section, included, excluded] of [
  ['ai', 'How we evaluate AI tools', 'Understanding wallet custody'],
  ['crypto', 'Understanding wallet custody', 'How we evaluate AI tools'],
]) {
  const { response, html } = await page(`/${section}/`);
  assert.equal(response.status, 200, `${section} route must work`);
  assert.match(html, /aria-current="page"/);
  assert.ok(html.includes(included));
  assert.ok(!html.includes(excluded), 'Section must not mix topics');
  assert.match(html, /Development sample/);
  const slug = section === 'ai' ? 'evaluating-ai-tools' : 'understanding-wallet-custody';
  assert.ok(html.includes(`/articles/${slug}/`));
  const article = await page(`/articles/${slug}/`);
  assert.equal(article.response.status, 200);
  assert.match(article.html, /Edited by <strong[^>]*>jienweng<\/strong>/);
  assert.match(article.html, /data-article-body/);
  assert.doesNotMatch(article.html, /Token on Air Desk|AI-generated/);
}
console.log('Newsroom HTTP smoke passed: brand, sections, isolation, links, fixture labels and editor credit.');
