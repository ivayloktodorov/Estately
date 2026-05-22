import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuthToken } from './lib/auth/jwt';
import { AUTH_COOKIE_NAME } from './lib/auth/types';

const protectedPagePaths = ['/dashboard', '/profile', '/favorites'];
const adminPaths = ['/admin', '/api/admin'];
const protectedApiPaths = ['/api/protected'];

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
  const isProtectedPage = isPathMatch(pathname, protectedPagePaths);
  const isProtectedApi = isPathMatch(pathname, protectedApiPaths);

  if (!isAdminRoute && !isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyAuthToken(token) : null;

  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return unauthorizedJson(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    return redirectToLogin(request);
  }

  if (isAdminRoute && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return unauthorizedJson(403, 'FORBIDDEN', 'Admin access required.');
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/favorites/:path*',
    '/admin/:path*',
    '/api/protected/:path*',
    '/api/admin/:path*',
  ],
};
