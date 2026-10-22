import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
if (existsSync(root + '.env')) process.loadEnvFile(root + '.env');
const env = { ...process.env, SANITY_STUDIO_PROJECT_ID: process.env.SANITY_PROJECT_ID, SANITY_STUDIO_DATASET: process.env.SANITY_DATASET, SANITY_STUDIO_TELEMETRY_DISABLED: '1' };
if (!env.SANITY_STUDIO_PROJECT_ID || !env.SANITY_STUDIO_DATASET) { console.error('Set SANITY_PROJECT_ID and SANITY_DATASET in the root .env (no credentials are printed).'); process.exit(1); }
const result = spawnSync(process.execPath, [root + 'node_modules/sanity/bin/sanity', ...process.argv.slice(2)], { cwd: root + 'studio', env, stdio: 'inherit' });
process.exit(result.status ?? 1);
