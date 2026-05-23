import type { AuthTokenPayload, UserRole } from './types';
import { AUTH_TOKEN_EXPIRES_IN_SECONDS, USER_ROLES } from './types';

interface JwtPayload extends AuthTokenPayload {
  exp: number;
  iat: number;
}

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlDecode(input: string): string {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not set.');
  }

  return secret;
}

async function getSigningKey(): Promise<CryptoKey> {
  signingKeyPromise ??= crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getJwtSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );

  return signingKeyPromise;
}

let signingKeyPromise: Promise<CryptoKey> | null = null;

function isValidPayload(payload: Partial<JwtPayload>): payload is JwtPayload {
  return (
    typeof payload.userId === 'number' &&
    typeof payload.email === 'string' &&
    typeof payload.role === 'string' &&
    USER_ROLES.includes(payload.role as UserRole) &&
    typeof payload.exp === 'number' &&
    typeof payload.iat === 'number'
  );
}

export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const tokenPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + AUTH_TOKEN_EXPIRES_IN_SECONDS,
  };
  const unsignedToken = [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(tokenPayload)),
  ].join('.');
  const signature = await crypto.subtle.sign(
    'HMAC',
    await getSigningKey(),
    new TextEncoder().encode(unsignedToken),
  );

  return `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = Uint8Array.from(
    atob(encodedSignature.replaceAll('-', '+').replaceAll('_', '/').padEnd(
      encodedSignature.length + ((4 - (encodedSignature.length % 4)) % 4),
      '=',
    )),
    (char) => char.charCodeAt(0),
  );
  const validSignature = await crypto.subtle.verify(
    'HMAC',
    await getSigningKey(),
    signature,
    new TextEncoder().encode(unsignedToken),
  );

  if (!validSignature) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<JwtPayload>;

  if (!isValidPayload(payload) || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}
