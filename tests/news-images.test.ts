import {expect,it} from 'vitest';
import {normalizeArticle} from '../frontend/src/lib/content/normalize';
import {rawArticle} from './fixtures/articles';
import {storyImage,storyThumbnail,shareImage,authorImage,imageCaption,showImageCredit} from '../frontend/src/lib/news-images';
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
it('uses text-free artwork for branded story-card thumbnails while preserving other images',()=>{
 const a=normalizeArticle(rawArticle({media:{url:'https://tokenonair.com/api/images/en/evaluating-ai-tools.png?revision=3&version=source-first-v6',alt:'AI tools',credit:'Token on Air',license:'Original editorial illustration · © Token on Air'}}));
 const thumbnail=storyThumbnail(a,'en');
 expect(new URL(thumbnail.url,'https://tokenonair.com').searchParams.get('layout')).toBe('thumbnail');
 const persisted=normalizeArticle(rawArticle({media:{url:'https://cdn.sanity.io/images/4k0o7q9m/production/generated.png',alt:'AI models',credit:'Token on Air',license:'Original editorial illustration · © Token on Air'}}));
 expect(storyThumbnail(persisted,'zh').url).toBe(`/api/images/zh/${persisted.slug}.png?revision=${encodeURIComponent(persisted.updatedAt)}&layout=thumbnail`);
 const licensed=normalizeArticle(rawArticle({media:{url:'https://cdn.sanity.io/photo.jpg',alt:'Forest',credit:'Photographer',license:'CC BY 4.0'}}));
 expect(storyThumbnail(licensed,'en').url).toBe('https://cdn.sanity.io/photo.jpg');
});
it('uses a branded avatar until a real portrait is supplied',()=>{
 expect(authorImage({name:'jienweng',slug:'jienweng'}).url).toBe('/brand/editor-avatar.png');
 expect(authorImage({name:'jienweng',slug:'jienweng',image:{url:'https://cdn.sanity.io/editor.jpg',alt:'Editor'}}).url).toContain('editor.jpg');
});

it('preserves author and licence attribution at every licensed image placement',()=>{const a=normalizeArticle(rawArticle({media:{url:'https://cdn.sanity.io/photo.jpg',alt:'Map',credit:'Original photographer',license:'CC BY 4.0'}}));expect(imageCaption(a)).toBe('Original photographer · CC BY 4.0');expect(imageCaption({...a,media:undefined})).toBeUndefined()});
it('keeps PANews permission and credit details out of public image captions',()=>{const a=normalizeArticle(rawArticle({media:{url:'https://cdn.sanity.io/photo.jpg',alt:'Map',credit:'PANews',license:'Used with permission',sourceUrl:'https://www.panewslab.com/en/articles/abc'}}));expect(showImageCredit(a.media!)).toBe(false);expect(imageCaption(a)).toBeUndefined();});
it('retains safe source and license links for image attribution',()=>{
 const a=normalizeArticle(rawArticle({media:{url:'https://cdn.sanity.io/photo.jpg',alt:'Image',credit:'Foundation',license:'CC BY 4.0',sourceUrl:'https://blog.ethereum.org/',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'}}));
 expect(a.media).toMatchObject({sourceUrl:'https://blog.ethereum.org/',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'});
 expect(()=>normalizeArticle(rawArticle({media:{url:'https://cdn.sanity.io/photo.jpg',alt:'Image',credit:'Owner',license:'CC',licenseUrl:'javascript:alert(1)'}}))).toThrow();
});
