import assert from 'node:assert/strict';
for(const host of ['tokenonair.com','www.tokenonair.com']){
 const base='https://'+host;
 for(const locale of ['en','zh','zh-cn']){
  const home=await fetch(`${base}/${locale}/`);assert.equal(home.status,200);const html=await home.text();assert.ok(html.includes(`/${locale}/archive/`));assert.ok(html.includes(`/${locale}/ai/rss.xml`));
  const archive=await fetch(`${base}/${locale}/archive/`);assert.equal(archive.status,200);assert.ok((await archive.text()).includes('archive-pagination'));
  for(const page of ['0','01','9007199254740992','abc'])assert.equal((await fetch(`${base}/${locale}/archive/${page}/`)).status,404);
  assert.equal((await fetch(`${base}/${locale}/archive/1/`,{redirect:'manual'})).status,308);
  for(const section of ['ai','crypto']){const r=await fetch(`${base}/${locale}/${section}/rss.xml`);assert.equal(r.status,200);assert.ok((await r.text()).includes(`/${locale}/${section}/rss.xml`));}
  assert.equal((await fetch(`${base}/${locale}/authors/missing/`)).status,404);
 }
 assert.equal((await fetch(base+'/api/health')).status,200);
 assert.ok((await(await fetch(base+'/sitemap.xml')).text()).includes('/en/archive/'));
 console.log(host+': new archive/navigation/feed/sitemap routes, invalid page handling, unknown author404 and health pass');
}
