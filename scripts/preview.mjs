// The local preview runner must never expose a preview-enabled build on all interfaces.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
if (existsSync(root+'.env')) process.loadEnvFile(root+'.env');
if (process.env.HOST && !['localhost','127.0.0.1','::1'].includes(process.env.HOST)) {
  console.error('Local preview must bind to loopback. Use the managed deployment adapter for remote hosting.');
  process.exit(1);
}
process.env.HOST=process.env.HOST || '127.0.0.1';
process.env.PORT=process.env.PORT || '4321';
await import('../frontend/dist/server/entry.mjs');
