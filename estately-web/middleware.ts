import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuthToken } from './lib/auth/jwt';
import { AUTH_COOKIE_NAME } from './lib/auth/types';

const protectedPagePaths = ['/dashboard', '/profile', '/favorites'];
const adminPaths = ['/admin', '/api/admin'];
const protectedApiPaths = ['/api/protected', '/api/notifications'];
const mobileApiPaths = ['/api/mobile'];

function withMobileCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

function isPathMatch(pathname: string, paths: string[]): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function unauthorizedJson(status: 401 | 403, code: 'UNAUTHORIZED' | 'FORBIDDEN', message: string) {
  return NextResponse.json({ status: 'error', error: { code, message } }, { status });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = isPathMatch(pathname, adminPaths);
  const isMobileApi = isPathMatch(pathname, mobileApiPaths);
  const isProtectedPage = isPathMatch(pathname, protectedPagePaths);
  const isProtectedApi = isPathMatch(pathname, protectedApiPaths);

  if (isMobileApi && request.method === 'OPTIONS') {
    return withMobileCorsHeaders(new NextResponse(null, { status: 204 }));
  }

  if (!isAdminRoute && !isProtectedPage && !isProtectedApi) {
    const response = NextResponse.next();

    return isMobileApi ? withMobileCorsHeaders(response) : response;
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyAuthToken(token) : null;

  if (!payload) {
    if (pathname.startsWith('/api/')) {
      const response = unauthorizedJson(401, 'UNAUTHORIZED', 'Authentication required.');

      return isMobileApi ? withMobileCorsHeaders(response) : response;
    }

    return redirectToLogin(request);
  }

  if (isAdminRoute && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      const response = unauthorizedJson(403, 'FORBIDDEN', 'Admin access required.');

      return isMobileApi ? withMobileCorsHeaders(response) : response;
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const response = NextResponse.next();

  return isMobileApi ? withMobileCorsHeaders(response) : response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/favorites/:path*',
    '/admin/:path*',
    '/api/protected/:path*',
    '/api/admin/:path*',
    '/api/mobile/:path*',
  ],
};
