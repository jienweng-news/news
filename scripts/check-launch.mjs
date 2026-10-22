import assert from 'node:assert/strict';
const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:4321';
const root=await fetch(base+'/',{redirect:'manual'});
assert.equal(root.status,307);assert.equal(root.headers.get('cache-control'),'private, no-store');assert.equal(root.headers.get('location'),'/en/');
const saved=await fetch(base+'/',{headers:{Cookie:'toa_locale=zh'},redirect:'manual'});assert.equal(saved.headers.get('location'),'/zh/');
for(const [locale,lang,headline]of [['en','en','The latest'],['zh','zh-Hant','最新報導'],['zh-cn','zh-Hans','最新报道']]){
 const response=await fetch(`${base}/${locale}/`);const html=await response.text();assert.equal(response.status,200);assert.ok(html.includes(`<html lang="${lang}"`));assert.ok(html.includes(headline));
 assert.ok(html.includes(`/${locale}/ai/`));assert.ok(html.includes('/api/language'));assert.ok(html.includes('hreflang='));
 const article=await fetch(`${base}/${locale}/articles/evaluating-ai-tools/`);const body=await article.text();assert.equal(article.status,200);assert.ok(body.includes('jienweng'));assert.ok(body.includes('application/ld+json'));
 if(locale==='zh')assert.ok(body.includes('如何評估 AI 工具'));if(locale==='zh-cn')assert.ok(body.includes('如何评估 AI 工具'));
 assert.equal((await fetch(`${base}/${locale}/articles/unpublished-example/`)).status,404);
}
console.log('Multilingual launch HTTP smoke passed: root/private redirect, saved language, locale HTML/navigation/article/SEO and draft isolation.');
