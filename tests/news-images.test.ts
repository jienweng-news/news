import {expect,it} from 'vitest';
import {normalizeArticle} from '../frontend/src/lib/content/normalize';
import {rawArticle} from './fixtures/articles';
import {storyImage,shareImage,authorImage,imageCaption} from '../frontend/src/lib/news-images';
it('normalizes a supplied author portrait and rejects unsafe URLs',()=>{
 const a=normalizeArticle(rawArticle({author:{name:'jienweng',slug:'jienweng',image:{url:'https://cdn.sanity.io/portrait.jpg',alt:'jienweng'}}}));
 expect(a.author.image?.alt).toBe('jienweng');
 expect(()=>normalizeArticle(rawArticle({author:{name:'jienweng',slug:'jienweng',image:{url:'javascript:alert(1)',alt:'Editor'}}}))).toThrow();
});
it('uses licensed media first and gives missing media a published-story PNG',()=>{
 const a=normalizeArticle(rawArticle());expect(storyImage(a,'zh').url).toBe('/api/images/zh/evaluating-ai-tools.png');
 const image={url:'https://cdn.sanity.io/story.jpg',alt:'Forest map',credit:'Author',license:'CC BY 4.0'};
 expect(storyImage({...a,media:image},'en')).toMatchObject(image);
 expect(shareImage(a,'en','https://tokenonair.com').url).toBe('https://tokenonair.com/api/images/en/evaluating-ai-tools.png');
});
it('uses a branded avatar until a real portrait is supplied',()=>{
 expect(authorImage({name:'jienweng',slug:'jienweng'}).url).toBe('/brand/editor-avatar.png');
 expect(authorImage({name:'jienweng',slug:'jienweng',image:{url:'https://cdn.sanity.io/editor.jpg',alt:'Editor'}}).url).toContain('editor.jpg');
});

it('preserves author and licence attribution at every licensed image placement',()=>{const a=normalizeArticle(rawArticle({media:{url:'https://cdn.sanity.io/photo.jpg',alt:'Map',credit:'Original photographer',license:'CC BY 4.0'}}));expect(imageCaption(a)).toBe('Original photographer · CC BY 4.0');expect(imageCaption({...a,media:undefined})).toBeUndefined()});
