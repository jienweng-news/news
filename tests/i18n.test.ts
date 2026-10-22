import { expect,it } from 'vitest';
import {chooseEntryLocale,safeLocaleTarget,localePath} from '../frontend/src/lib/i18n';
it('gives saved choice priority and maps CN separately from Taiwan',()=>{
 expect(chooseEntryLocale('en','CN')).toBe('en');expect(chooseEntryLocale(undefined,'CN')).toBe('zh-cn');
 expect(chooseEntryLocale(undefined,'TW')).toBe('zh');expect(chooseEntryLocale('invalid','US')).toBe('en');
});
it('rejects cross-origin or ambiguous preference redirect targets',()=>{
 for(const value of ['https://evil.test','//evil.test','/zh/../api/','/zh/%2f/','/preview/'])expect(safeLocaleTarget(value)).toBeNull();
 expect(safeLocaleTarget('/zh/articles/story/')).toBe('/zh/articles/story/');
 expect(localePath('zh-cn','articles/story')).toBe('/zh-cn/articles/story/');
});
