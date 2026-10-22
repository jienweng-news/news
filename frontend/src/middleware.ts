import { defineMiddleware } from 'astro:middleware';
import { crossOriginSubmission, withPreviewHeaders } from './lib/preview/http';
export const onRequest = defineMiddleware(async ({ url,request },next) => {
  const preview = /^\/(preview|api\/preview)(\/|$)/.test(url.pathname);
  if (crossOriginSubmission(request)) {
    const response = new Response('Cross-origin submission rejected.',{status:403});
    return preview ? withPreviewHeaders(response) : response;
  }
  if (!preview) return next();
  try { return withPreviewHeaders(await next()); }
  catch { return withPreviewHeaders(new Response('Preview is temporarily unavailable.',{status:503})); }
});
