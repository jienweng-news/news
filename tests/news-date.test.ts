import {expect,it} from 'vitest';
import {publicationTime} from '../frontend/src/lib/news-date';
it('shows an absolute publication date and UTC time in all three editions',()=>{
 for(const locale of ['en','zh','zh-cn'] as const){const value=publicationTime('2026-10-23T07:56:15Z',locale);expect(value).toContain('2026');expect(value).toContain('07:56');expect(value).toContain('UTC');expect(value).not.toMatch(/ago|today|just now/i);}
});
