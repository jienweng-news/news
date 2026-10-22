import {chooseEntryLocale} from './lib/i18n';
import { defineMiddleware } from 'astro:middleware';
import { crossOriginSubmission, withPreviewHeaders } from './lib/preview/http';
export const onRequest = defineMiddleware(async ({ url,request,cookies },next) => {
  if(url.pathname==='/'){const country=process.env.VERCEL==='1'?request.headers.get('x-vercel-ip-country')||undefined:undefined;return new Response(null,{status:307,headers:{Location:`/${chooseEntryLocale(cookies.get('toa_locale')?.value,country)}/`,'Cache-Control':'private, no-store',Vary:'Cookie'}});}
  const preview = /^\/(preview|api\/preview)(\/|$)/.test(url.pathname);
  if (crossOriginSubmission(request)) {
    const response = new Response('Cross-origin submission rejected.',{status:403});
    return preview ? withPreviewHeaders(response) : response;
  }
  if (!preview) return next();
  try { return withPreviewHeaders(await next()); }
  catch { return withPreviewHeaders(new Response('Preview is temporarily unavailable.',{status:503})); }
});
