import {expect,it,vi} from 'vitest';
import {sanityApi} from '../workers/news/sanity';

it('returns original asset URLs for cross-story duplicate checks across approved image providers',async()=>{
 const get=vi.spyOn(globalThis,'fetch').mockResolvedValue(Response.json({result:[
  {source:'https://www.pexels.com/photo/semiconductor-chip-1089438/'},
  {source:'https://www.pexels.com/photo/forest-canopy-12345/'},
  {source:'https://commons.wikimedia.org/wiki/File:Wafer.jpg'},
  {source:'https://uploads.panewslab.com/5bee5808-d018-409d-9257-89c453c91b2b'},
  {source:'https://www.panewslab.com/en/articles/abc'},
  null
 ]}));
 try{
  const api=sanityApi({SANITY_PROJECT_ID:'4k0o7q9m',SANITY_DATASET:'production',SANITY_WRITE_TOKEN:'x'.repeat(40),SANITY_EDITOR_ID:'editor-jienweng'} as never);
  expect(await api.usedImageSources()).toEqual([
   'https://www.pexels.com/photo/semiconductor-chip-1089438/',
   'https://www.pexels.com/photo/forest-canopy-12345/',
   'https://commons.wikimedia.org/wiki/File:Wafer.jpg',
   'https://uploads.panewslab.com/5bee5808-d018-409d-9257-89c453c91b2b'
  ]);
  expect(String(get.mock.calls[0][0])).toContain('mainImage.originalImageUrl');
 }finally{get.mockRestore();}
});
