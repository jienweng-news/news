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
