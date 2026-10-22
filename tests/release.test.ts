import {expect,it} from 'vitest';
import {releaseReadiness} from '../frontend/src/lib/release';
it('keeps missing live services blocked without printing credentials',()=>{
 const report=releaseReadiness({SANITY_READ_TOKEN:'private-test-token',SANITY_WRITE_TOKEN:'private-write-token'});
 expect(report.ready).toBe(false);expect(report.checks.find(c=>c.id==='cms')?.ready).toBe(false);expect(JSON.stringify(report)).not.toContain('private-');
});
it('does not mistake configured IDs for live verified services',()=>{
 const report=releaseReadiness({CONTENT_MODE:'sanity',SANITY_PROJECT_ID:'abc',SANITY_DATASET:'production',SITE_URL:'https://tokenonair.com',GA4_MEASUREMENT_ID:'G-ABC123'});
 expect(report.ready).toBe(false);expect(report.checks.find(c=>c.id==='liveAcceptance')?.ready).toBe(false);
});
