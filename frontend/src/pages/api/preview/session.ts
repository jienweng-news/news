import type { APIRoute } from 'astro';
import { runtimeConfig } from '../../../lib/runtime';
import { handlePreviewLogin } from '../../../lib/preview/http';
export const POST: APIRoute = ({ request }) => handlePreviewLogin(request,runtimeConfig());
