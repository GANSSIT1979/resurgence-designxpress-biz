import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, getLoginRedirect, isPathAllowedForRole, verifySession } from '@/lib/auth';
import { getRequiredPermission } from '@/lib/permissions';

const localHttpsHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);

function shouldRedirectToHttps(request: NextRequest) {
  if (process.env.FORCE_HTTPS !== 'true') return false;

  const hostname = request.nextUrl.hostname;
  if (localHttpsHosts.has(hostname)) return false;

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProto || request.nextUrl.protocol.replace(':', '');
  return protocol === 'http';
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const requiredPermission = getRequiredPermission(pathname, request.method);

  if (shouldRedirectToHttps(request)) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 308);
  }

  if (pathname === '/login') {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return NextResponse.redirect(new URL('/login', request.url), 303);
    }

    const payload = await verifySession(token);
    if (payload) {
      return NextResponse.redirect(new URL(getLoginRedirect(payload.role), request.url));
    }
    return NextResponse.next();
  }

  if (requiredPermission) {
    const payload = await verifySession(token);

    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (!isPathAllowedForRole(pathname, payload.role, request.method)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL(getLoginRedirect(payload.role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets|uploads).*)',
  ],
};
