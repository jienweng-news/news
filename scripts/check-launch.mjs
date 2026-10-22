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
for(const locale of ['en','zh','zh-cn']){
 const feed=await fetch(`${base}/${locale}/rss.xml`);assert.equal(feed.status,200);assert.match(await feed.text(),/<rss version="2.0"/);
 for(const path of ['about','policy','privacy','contact','advertise','search'])assert.equal((await fetch(`${base}/${locale}/${path}/`)).status,200);
}
assert.match(await (await fetch(base+'/sitemap.xml')).text(),/<urlset/);
assert.equal((await fetch(base+'/api/health')).status,200);
const language=await fetch(base+'/api/language',{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:'target=%2Fzh-cn%2F',redirect:'manual'});assert.equal(language.status,303);assert.equal(language.headers.get('location'),'/zh-cn/');assert.match(language.headers.get('set-cookie'),/toa_locale=zh-cn/);
const unsafe=await fetch(base+'/api/language',{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:'target=https%3A%2F%2Fevil.test',redirect:'manual'});assert.equal(unsafe.status,400);
const signup=await fetch(base+'/api/subscribe',{method:'POST',headers:{Origin:base,Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:'email=reader%40example.com&language=en&consent=yes'});assert.equal(signup.status,503);assert.deepEqual(await signup.json(),{accepted:false});
console.log('Multilingual launch HTTP smoke passed: root/private redirect, saved language, locale HTML/navigation/article/SEO and draft isolation.');
