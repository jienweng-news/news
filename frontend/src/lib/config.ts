export interface AppConfig {
  appEnv: 'local' | 'staging' | 'production';
  contentMode: 'fixture' | 'sanity';
  siteUrl: string;
  siteName: string;
  sanityProjectId?: string;
  sanityDataset?: string;
  sanityReadToken?: string;
  previewEnabled: boolean;
  previewAccessKey?: string;
  previewSigningSecret?: string;
}
export function readConfig(env: Record<string, string | undefined>): AppConfig {
  const declared = env.APP_ENV || 'local';
  if (!['local', 'staging', 'production'].includes(declared)) throw new Error('Invalid APP_ENV');
  const hosted = Boolean(env.VERCEL_ENV || env.VERCEL === '1');
  const appEnv = env.VERCEL_ENV === 'production' ? 'production' : hosted && declared === 'local' ? 'staging' : declared as AppConfig['appEnv'];
  const contentMode = env.CONTENT_MODE || 'fixture';
  if (contentMode !== 'fixture' && contentMode !== 'sanity') throw new Error('Invalid CONTENT_MODE');
  if (appEnv !== 'local' && contentMode === 'fixture') throw new Error('Fixture content cannot be deployed');
  let site: URL;
  try { site = new URL(env.SITE_URL || 'http://localhost:4321'); } catch { throw new Error('SITE_URL must be an absolute origin'); }
  if (!['https:', 'http:'].includes(site.protocol) || site.username || site.password || site.pathname !== '/' || site.search || site.hash) throw new Error('SITE_URL must be an HTTP(S) origin');
  if (appEnv !== 'local' && site.protocol !== 'https:') throw new Error('Deployed SITE_URL requires HTTPS');
  const projectId = env.SANITY_PROJECT_ID?.trim(); const dataset = env.SANITY_DATASET?.trim();
  if (contentMode === 'sanity' && (!projectId || !/^[a-z0-9]+$/.test(projectId) || !dataset || !/^[a-z0-9_-]+$/.test(dataset))) throw new Error('Valid Sanity project and dataset IDs are required');
  const key = env.PREVIEW_ACCESS_KEY; const secret = env.PREVIEW_SIGNING_SECRET;
  return {
    appEnv, contentMode, siteUrl: site.origin, siteName: env.PUBLIC_SITE_NAME?.trim() || 'News',
    sanityProjectId: projectId, sanityDataset: dataset, sanityReadToken: env.SANITY_READ_TOKEN,
    previewEnabled: appEnv === 'local' && !hosted && Boolean(key && key.length >= 32 && secret && secret.length >= 32),
    previewAccessKey: key, previewSigningSecret: secret,
  };
}
