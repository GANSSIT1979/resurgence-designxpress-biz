import { NextRequest, NextResponse } from 'next/server';

const ROOT_DOMAINS = new Set(['resurgence-dx.biz', 'www.resurgence-dx.biz']);

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

const MODULE_SESSION_COOKIE: Record<string, string> = {
  '/admin': 'resurgence_admin_session',
  '/crm': 'resurgence_admin_session',
  '/login': 'resurgence_public_session',
  '/feed': 'resurgence_user_session',
  '/events': 'resurgence_user_session',
  '/shop': 'resurgence_user_session',
  '/partnerships': 'resurgence_partner_session',
  '/support': 'resurgence_user_session',
};

const MODULE_ALLOWED_ROLES: Record<string, string[]> = {
  '/admin': ['SYSTEM_ADMIN', 'STAFF'],
  '/crm': ['SYSTEM_ADMIN', 'STAFF', 'PARTNER', 'SPONSOR'],
  '/feed': ['SYSTEM_ADMIN', 'STAFF', 'MEMBER', 'SPONSOR', 'PARTNER', 'CREATOR', 'COACH', 'REFEREE'],
  '/events': ['SYSTEM_ADMIN', 'STAFF', 'MEMBER', 'SPONSOR', 'PARTNER', 'CREATOR'],
  '/shop': ['SYSTEM_ADMIN', 'STAFF', 'MEMBER', 'SPONSOR', 'PARTNER', 'CREATOR'],
  '/partnerships': ['SYSTEM_ADMIN', 'STAFF', 'PARTNER'],
  '/support': ['SYSTEM_ADMIN', 'STAFF', 'MEMBER', 'SPONSOR', 'PARTNER', 'CREATOR', 'COACH', 'REFEREE'],
};

const PUBLIC_MODULES = new Set(['/login']);
const PUBLIC_PATH_PREFIXES = ['/login', '/api/auth', '/api/public'];

function normalizeHost(hostHeader: string | null) {
  return (hostHeader || '').split(':')[0].toLowerCase();
}

function isSystemPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  );
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function getRequestRole(request: NextRequest) {
  return request.cookies.get('resurgence_role')?.value || request.headers.get('x-resurgence-role') || '';
}

function getTenantFromRequest(host: string, request: NextRequest) {
  const explicitTenant = request.cookies.get('resurgence_tenant')?.value || request.headers.get('x-resurgence-tenant');
  if (explicitTenant) return explicitTenant;

  const hostParts = host.split('.');
  if (hostParts.length > 3 && host.endsWith('.resurgence-dx.biz')) {
    return hostParts[0];
  }

  return 'default';
}

function getModulePath(host: string, pathname: string) {
  const byHost = SUBDOMAIN_MODULES[host];
  if (byHost) return byHost;

  return Object.values(SUBDOMAIN_MODULES).find((modulePath) => pathname === modulePath || pathname.startsWith(`${modulePath}/`)) || null;
}

function redirectToLogin(request: NextRequest, tenant: string) {
  const url = request.nextUrl.clone();
  url.hostname = 'login.resurgence-dx.biz';
  url.pathname = '/login';
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  url.searchParams.set('tenant', tenant);
  return NextResponse.redirect(url);
}

function appendContextHeaders(response: NextResponse, tenant: string, modulePath: string) {
  response.headers.set('x-resurgence-tenant', tenant);
  response.headers.set('x-resurgence-module', modulePath);
  return response;
}

export function middleware(request: NextRequest) {
  const host = normalizeHost(request.headers.get('host'));
  const pathname = request.nextUrl.pathname;

  if (!host || host.includes('localhost') || host.endsWith('.vercel.app') || isSystemPath(pathname)) {
    return NextResponse.next();
  }

  const tenant = getTenantFromRequest(host, request);
  const modulePath = getModulePath(host, pathname);

  if (!modulePath || ROOT_DOMAINS.has(host)) {
    const response = NextResponse.next();
    response.headers.set('x-resurgence-tenant', tenant);
    return response;
  }

  const sessionCookieName = MODULE_SESSION_COOKIE[modulePath] || 'resurgence_user_session';
  const session = request.cookies.get(sessionCookieName)?.value;
  const role = getRequestRole(request);
  const allowedRoles = MODULE_ALLOWED_ROLES[modulePath] || [];
  const isPublicModule = PUBLIC_MODULES.has(modulePath) || isPublicPath(pathname);

  if (!isPublicModule) {
    if (!session) return redirectToLogin(request, tenant);
    if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL('/login?error=forbidden', request.url));
    }
  }

  if (host in SUBDOMAIN_MODULES && !(pathname === modulePath || pathname.startsWith(`${modulePath}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? modulePath : `${modulePath}${pathname}`;
    return appendContextHeaders(NextResponse.rewrite(url), tenant, modulePath);
  }

  return appendContextHeaders(NextResponse.next(), tenant, modulePath);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
