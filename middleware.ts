import { NextRequest, NextResponse } from 'next/server';

const ROOT_DOMAINS = new Set([
  'resurgence-dx.biz',
  'www.resurgence-dx.biz',
]);

const SUBDOMAIN_MODULES: Record<string, string> = {
  'admin.resurgence-dx.biz': '/admin',
  'crm.resurgence-dx.biz': '/crm',
  'login.resurgence-dx.biz': '/login',
  'feed.resurgence-dx.biz': '/feed',
  'events.resurgence-dx.biz': '/events',
  'shop.resurgence-dx.biz': '/shop',
  'partnership.resurgence-dx.biz': '/partnerships',
  'support.resurgence-dx.biz': '/support',
};

function normalizeHost(hostHeader: string | null) {
  return (hostHeader || '').split(':')[0].toLowerCase();
}

function isSystemPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  );
}

export function middleware(request: NextRequest) {
  const host = normalizeHost(request.headers.get('host'));
  const pathname = request.nextUrl.pathname;

  // Root domains → no rewrite
  if (!host || ROOT_DOMAINS.has(host) || isSystemPath(pathname)) {
    return NextResponse.next();
  }

  const modulePath = SUBDOMAIN_MODULES[host];

  // Unknown subdomain → pass through
  if (!modulePath) {
    return NextResponse.next();
  }

  // Prevent infinite rewrite loops
  if (pathname === modulePath || pathname.startsWith(`${modulePath}/`)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  // Root of subdomain → module root
  url.pathname = pathname === '/' 
    ? modulePath 
    : `${modulePath}${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
