import type { APIRoute } from 'astro';
import { runtimeConfig } from '../../../lib/runtime';
import { handlePreviewLogout } from '../../../lib/preview/http';
export const POST: APIRoute = ({ request }) => handlePreviewLogout(request,runtimeConfig());
