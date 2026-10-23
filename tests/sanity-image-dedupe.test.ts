import {expect,it,vi} from 'vitest';
import {sanityApi} from '../workers/news/sanity';

it('returns published stock photo source URLs for cross-story duplicate checks only',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({result:[
  'https://www.pexels.com/photo/semiconductor-chip-1089438/',
  'https://www.pexels.com/photo/forest-canopy-12345/',
  'https://commons.wikimedia.org/wiki/File:Wafer.jpg',
  'https://www.panewslab.com/en/articles/abc',
  null
 ]}));
 try{
  const api=sanityApi({SANITY_PROJECT_ID:'4k0o7q9m',SANITY_DATASET:'production',SANITY_WRITE_TOKEN:'x'.repeat(40),SANITY_EDITOR_ID:'editor-jienweng'} as never);
  expect(await api.usedImageSources()).toEqual([
   'https://www.pexels.com/photo/semiconductor-chip-1089438/',
   'https://www.pexels.com/photo/forest-canopy-12345/',
   'https://commons.wikimedia.org/wiki/File:Wafer.jpg'
  ]);
  expect(String(get.mock.calls[0][0])).toContain('mainImage.sourceUrl');
 }finally{get.mockRestore();}
});
