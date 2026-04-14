import { NextRequest, NextResponse } from "next/server";
import { getDashboardPath, SESSION_COOKIE, verifySession } from "@/lib/auth";
import { canAccessPath } from "@/lib/permissions";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/sponsors",
  "/sponsor/apply",
  "/contact",
  "/support",
  "/login"
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/openai") ||
    pathname.startsWith("/api/chatkit") ||
    pathname.startsWith("/api/inquiries") ||
    pathname.startsWith("/api/sponsor-applications") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(getDashboardPath(session.role), request.url));
  }

  if (isPublicPath(pathname) || pathname.startsWith("/creator/")) {
    return NextResponse.next();
  }

  const isProtectedPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cashier") ||
    pathname.startsWith("/sponsor/dashboard") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/partner");

  if (isProtectedPage) {
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      const response = NextResponse.redirect(url);
      return token ? clearSession(response) : response;
    }

    if (!canAccessPath(pathname, session.role)) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      return clearSession(response);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cashier/:path*",
    "/sponsor/:path*",
    "/staff/:path*",
    "/partner/:path*",
    "/creator/:path*",
    "/login",
    "/api/:path*"
  ]
};
