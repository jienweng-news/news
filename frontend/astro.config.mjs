import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';
import { readConfig } from './src/lib/config.ts';
const env = { ...loadEnv(process.env.NODE_ENV || 'development', new URL('..', import.meta.url).pathname, ''), ...process.env };
const config = readConfig(env);
export default defineConfig({
  site: config.siteUrl,
  envDir: '..',
  output: 'server',
  adapter: env.VERCEL === '1' ? vercel() : node({ mode: 'standalone' }),
  vite: { define: { 'import.meta.env.APP_ENV': JSON.stringify(config.appEnv), 'import.meta.env.CONTENT_MODE': JSON.stringify(config.contentMode) } },
});
