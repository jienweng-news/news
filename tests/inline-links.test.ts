import {expect,it} from 'vitest';
import {citationBlock} from '../frontend/src/lib/content/inline-links';
const url='https://research.google/blog/study/';
it('makes approved Markdown and literal citation URLs clickable without losing surrounding punctuation',()=>{
 const b=citationBlock(`See [the study](${url}) and ${url}.`,'p',[url]);
 expect(b.children.map(s=>s.text).join('')).toBe(`See the study and ${url}.`);
 expect(b.markDefs.map(m=>m.href)).toEqual([url,url]);expect(b.children.filter(s=>s.marks.length)).toHaveLength(2);
});
it('keeps unapproved, credential-bearing and unsafe destinations unlinked',()=>{
 for(const text of ['[bad](javascript:alert(1))','[bad](https://evil.test/)','https://user:password@research.google/blog/study/'])expect(citationBlock(text,'p',[url]).markDefs).toEqual([]);
});
