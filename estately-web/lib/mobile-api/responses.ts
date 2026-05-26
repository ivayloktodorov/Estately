import { NextResponse, type NextRequest } from 'next/server';

const allowedMobileOrigins = new Set([
  'https://estatelybg-mobile.netlify.app',
  'https://estately-mobile-bg.netlify.app',
]);

const allowedMethods = 'GET,POST,PATCH,PUT,DELETE,OPTIONS';
const allowedHeaders = 'Content-Type, Authorization';

function isLocalhostOrigin(origin: string): boolean {
  try {
    const { hostname, protocol } = new URL(origin);

    return protocol === 'http:' && ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
  } catch {
    return false;
  }
}

export function getMobileCorsOrigin(request?: NextRequest): string {
  const origin = request?.headers.get('origin') ?? '';

  if (allowedMobileOrigins.has(origin) || isLocalhostOrigin(origin)) {
    return origin;
  }

  return 'https://estatelybg-mobile.netlify.app';
}

export function withMobileCorsHeaders(response: NextResponse, request?: NextRequest): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', getMobileCorsOrigin(request));
  response.headers.set('Access-Control-Allow-Methods', allowedMethods);
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders);
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.set('Vary', 'Origin');

  return response;
}

export function mobileOptions(request: NextRequest): NextResponse {
  return withMobileCorsHeaders(new NextResponse(null, { status: 204 }), request);
}

export function mobileSuccess<TData>(data: TData, status = 200, request?: NextRequest): NextResponse {
  return withMobileCorsHeaders(NextResponse.json({ success: true, data }, { status }), request);
}

export function mobileError(error: string, status = 400, request?: NextRequest): NextResponse {
  return withMobileCorsHeaders(NextResponse.json({ success: false, error }, { status }), request);
}
