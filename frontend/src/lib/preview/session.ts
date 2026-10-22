const TTL = 15 * 60 * 1000;
const encoder = new TextEncoder();
async function signingKey(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign','verify']);
}
export async function createPreviewSession(secret: string, now: number): Promise<string> {
  if (secret.length < 32 || !Number.isSafeInteger(now)) throw new Error('Preview signing configuration is invalid');
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const payload = Buffer.from(JSON.stringify({ v:1, issuedAt:now, expiresAt:now+TTL, nonce:Buffer.from(nonce).toString('base64url') })).toString('base64url');
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(payload));
  return `${payload}.${Buffer.from(signature).toString('base64url')}`;
}
export async function verifyPreviewSession(value: string, secret: string, now: number): Promise<boolean> {
  try {
    if (secret.length < 32 || value.length > 1024 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) return false;
    const [payload, signature] = value.split('.');
    const sig = Buffer.from(signature, 'base64url');
    if (sig.toString('base64url') !== signature || !await crypto.subtle.verify('HMAC', await signingKey(secret), sig, encoder.encode(payload))) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.v === 1 && Number.isSafeInteger(data.issuedAt) && Number.isSafeInteger(data.expiresAt) && data.expiresAt - data.issuedAt === TTL && data.issuedAt <= now && now < data.expiresAt && typeof data.nonce === 'string' && /^[A-Za-z0-9_-]{22}$/.test(data.nonce);
  } catch { return false; }
}
