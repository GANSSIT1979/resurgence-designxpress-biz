import { NextRequest, NextResponse } from 'next/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'resurgence-dx.biz';

const SUBDOMAIN_PATHS: Record<string, string> = {
  admin: '/admin',
  crm: '/crm',
  login: '/login',
  feed: '/feed',
  events: '/events',
  shop: '/shop',
  partnership: '/partnerships',
  support: '/support',
};

const AUTH_SUBDOMAINS = new Set(['admin', 'crm']);
const AUTH_COOKIE_NAMES = ['resurgence_session', 'session', 'auth_token', 'admin_session'];

function normalizeHost(host: string) {
  return host.split(':')[0].toLowerCase();
}

function hasAuthCookie(req: NextRequest) {
  return AUTH_COOKIE_NAMES.some((name) => Boolean(req.cookies.get(name)?.value));
}

function isAssetPath(pathname: string) {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/branding') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/icon.png'
  );
}

function alreadyPrefixed(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const hostname = normalizeHost(host);
  const pathname = req.nextUrl.pathname;

  if (isAssetPath(pathname)) return NextResponse.next();

  if (hostname === ROOT_DOMAIN) {
    const url = req.nextUrl.clone();
    url.hostname = `www.${ROOT_DOMAIN}`;
    return NextResponse.redirect(url);
  }

  if (hostname === `www.${ROOT_DOMAIN}`) {
    return NextResponse.next();
  }

  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return NextResponse.next();
  }

  const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '');
  const basePath = SUBDOMAIN_PATHS[subdomain];

  if (!basePath) return NextResponse.next();

  if (AUTH_SUBDOMAINS.has(subdomain)) {
    const isLoginPath = pathname === '/login' || pathname.startsWith('/login/');
    const isAdminLoginPath = pathname === '/admin/login' || pathname.startsWith('/admin/login/');

    if (!hasAuthCookie(req) && !isLoginPath && !isAdminLoginPath) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.hostname = `login.${ROOT_DOMAIN}`;
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', `https://${hostname}${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (alreadyPrefixed(pathname, basePath)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `${basePath}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png).*)'],
};
