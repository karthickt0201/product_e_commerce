/**
 * Thin wrapper around the browser's native SubtleCrypto SHA-256 implementation.
 * We deliberately avoid a third-party bcrypt/crypto library — the assignment only
 * requires that plaintext passwords never sit in the mock store, and SubtleCrypto
 * ships in every evergreen browser.
 */
export async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Base64url encode a plain object — used for building the mock JWT. */
export function base64UrlEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Base64url decode back into a plain object. */
export function base64UrlDecode<T>(token: string): T {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const json = decodeURIComponent(escape(atob(padded)));
  return JSON.parse(json) as T;
}
