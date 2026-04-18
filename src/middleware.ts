import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, getLoginRedirect, isPathAllowedForRole, verifySession } from '@/lib/auth';
import { getRequiredPermission } from '@/lib/permissions';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const requiredPermission = getRequiredPermission(pathname, request.method);

  if (pathname === '/login') {
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
    '/login',
    '/admin/:path*',
    '/cashier/:path*',
    '/staff/:path*',
    '/partner/:path*',
    '/sponsor/dashboard/:path*',
    '/sponsor/applications/:path*',
    '/sponsor/packages/:path*',
    '/sponsor/deliverables/:path*',
    '/sponsor/billing/:path*',
    '/sponsor/profile/:path*',
    '/creator/dashboard/:path*',
    '/api/:path*',
  ],
};
