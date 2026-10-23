import { expect, it, vi } from 'vitest';
import { resolveArticlePage } from '../frontend/src/lib/content/page';
import { ContentUnavailableError } from '../frontend/src/lib/content/repository';
it('distinguishes absent and unavailable articles', async () => {
  const getPublished = vi.fn().mockResolvedValue(null);
  expect((await resolveArticlePage(getPublished, 'missing')).status).toBe(404);
  getPublished.mockRejectedValue(new ContentUnavailableError());
  const result = await resolveArticlePage(getPublished, 'existing');
  expect(result.status).toBe(503); expect(result.article).toBeNull();
});
import {resolveListingPage} from '../frontend/src/lib/content/listing';
it('resolves listing status before rendering and never caches an outage',async()=>{
 const result=await resolveListingPage(async()=>{throw new ContentUnavailableError();},true);
 expect(result).toEqual({articles:[],unavailable:true,status:503,cacheControl:'no-store'});
 expect(await resolveListingPage(async()=>[],true)).toEqual({articles:[],unavailable:false,status:200,cacheControl:'public, max-age=0, s-maxage=30'});
 expect((await resolveListingPage(async()=>[],false)).cacheControl).toBe('no-store');
});
