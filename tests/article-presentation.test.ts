import {expect,it} from 'vitest';
import {presentArticleBody,sourceLabel} from '../frontend/src/lib/article-presentation';
import type {BodyBlock} from '../frontend/src/lib/content/types';
const block=(text:string):BodyBlock=>({_type:'block',_key:text,style:'normal',children:[{_type:'span',_key:'text',text,marks:[]}],markDefs:[]});
it('separates generated credits without losing their required text and links',()=>{
 const credit=block('Source: Ethereum Foundation; original authors credited at https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay. CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Original reporting and translations; changes made. No endorsement.');
 const input=[block('News body.'),credit];const result=presentArticleBody(input);
 expect(result.body).toEqual([input[0]]);expect(result.credits).toHaveLength(1);
 expect(result.credits[0].children.map(c=>c.text).join('')).toBe(credit.children[0].text);
 expect(result.credits[0].markDefs.map(m=>m.href)).toEqual(['https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay','https://creativecommons.org/licenses/by/4.0/']);
 expect(input[1].markDefs).toEqual([]);
});
it('keeps ordinary source discussion in the body',()=>{expect(presentArticleBody([block('Source: an interview with researchers.')]).credits).toEqual([])});
it('distinguishes references on the same publisher',()=>{
 expect(sourceLabel('https://blog.ethereum.org/en/2026/10/22/glamsterdam-hoodi-delay')).toBe('Glamsterdam hoodi delay');
 expect(sourceLabel('https://blog.ethereum.org/')).toBe('blog.ethereum.org');
});
