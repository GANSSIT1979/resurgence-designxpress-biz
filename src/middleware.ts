import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, getLoginRedirect, isPathAllowedForRole, verifySession } from '@/lib/auth';
import { getRequiredPermission } from '@/lib/permissions';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'resurgence-dx.biz';

const localHttpsHosts = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
]);

const SUBDOMAIN_MODULES: Record<string, string> = {
  admin: '/admin',
  crm: '/crm',
  login: '/login',
  feed: '/feed',
  events: '/events',
  shop: '/shop',
  partnership: '/partnerships',
  support: '/support',
};

function shouldRedirectToHttps(request: NextRequest) {
  if (process.env.FORCE_HTTPS !== 'true') return false;

  const hostname = request.nextUrl.hostname;
  if (localHttpsHosts.has(hostname)) return false;

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProto || request.nextUrl.protocol.replace(':', '');

  return protocol === 'http';
}

function normalizeHostname(request: NextRequest) {
  return request.nextUrl.hostname.toLowerCase();
}

function stripDuplicateModulePath(pathname: string, modulePath: string) {
  if (pathname === modulePath) return '/';

  if (pathname.startsWith(`${modulePath}/`)) {
    return pathname.replace(modulePath, '') || '/';
  }

  return pathname;
}

function getSubdomainRewriteUrl(request: NextRequest) {
  const hostname = normalizeHostname(request);
  const url = request.nextUrl.clone();

  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return null;
  }

  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return null;
  }

  const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '');
  const modulePath = SUBDOMAIN_MODULES[subdomain];

  if (!modulePath) {
    return null;
  }

  const cleanPathname = stripDuplicateModulePath(url.pathname, modulePath);

  url.pathname = cleanPathname === '/'
    ? modulePath
    : `${modulePath}${cleanPathname}`;

  return url;
}

function getRootRedirectUrl(request: NextRequest) {
  const hostname = normalizeHostname(request);

  if (hostname !== ROOT_DOMAIN) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.hostname = `www.${ROOT_DOMAIN}`;
  url.protocol = 'https:';

  return url;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (shouldRedirectToHttps(request)) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 308);
  }

  const rootRedirectUrl = getRootRedirectUrl(request);
  if (rootRedirectUrl) {
    return NextResponse.redirect(rootRedirectUrl, 308);
  }

  const subdomainRewriteUrl = getSubdomainRewriteUrl(request);
  const effectivePathname = subdomainRewriteUrl?.pathname || pathname;

  if (effectivePathname === '/login') {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return NextResponse.redirect(new URL('/login', request.url), 303);
    }

    const payload = await verifySession(token);
    if (payload) {
      return NextResponse.redirect(new URL(getLoginRedirect(payload.role), request.url));
    }

    if (subdomainRewriteUrl) {
      return NextResponse.rewrite(subdomainRewriteUrl);
    }

    return NextResponse.next();
  }

  const requiredPermission = getRequiredPermission(effectivePathname, request.method);

  if (requiredPermission) {
    const payload = await verifySession(token);

    if (!payload) {
      if (effectivePathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', `${effectivePathname}${search}`);

      return NextResponse.redirect(loginUrl);
    }

    if (!isPathAllowedForRole(effectivePathname, payload.role, request.method)) {
      if (effectivePathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.redirect(new URL(getLoginRedirect(payload.role), request.url));
    }
  }

  if (subdomainRewriteUrl) {
    return NextResponse.rewrite(subdomainRewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets|uploads).*)',
  ],
};
