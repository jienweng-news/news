// Read-only acceptance check for a running, configured Sanity-backed reader site.
import assert from 'node:assert/strict';
const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:4321';
const health=await fetch(base+'/api/health');assert.equal(health.status,200,'Configured reader health must succeed');assert.deepEqual(await health.json(),{status:'ok',content:'sanity'});
for(const locale of ['en','zh','zh-cn']){const response=await fetch(`${base}/${locale}/`);const html=await response.text();assert.equal(response.status,200);assert.match(html,/<html lang=/);assert.doesNotMatch(html,/aria-label="Development content"/);assert.doesNotMatch(html,/data-analytics-id=/);}
console.log('Configured local Sanity reader: health and all three editions render; fixtures and analytics are absent. No CMS writes or GA events performed.');
