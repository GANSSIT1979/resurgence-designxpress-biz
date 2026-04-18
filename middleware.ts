import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession, getDashboardPath } from "@/lib/auth";

const protectedPrefixes = [
  "/admin",
  "/cashier",
  "/staff",
  "/partner",
  "/sponsor/dashboard",
];

function roleMatchesPath(role: string, pathname: string) {
  if (pathname.startsWith("/admin")) return role === "SYSTEM_ADMIN";
  if (pathname.startsWith("/cashier")) return role === "CASHIER";
  if (pathname.startsWith("/staff")) return role === "STAFF";
  if (pathname.startsWith("/partner")) return role === "PARTNER";
  if (pathname.startsWith("/sponsor/dashboard")) return role === "SPONSOR";
  return true;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(loginUrl);
    if (token) {
      res.cookies.set({
        name: SESSION_COOKIE,
        value: "",
        path: "/",
        maxAge: 0,
      });
    }
    return res;
  }

  if (!roleMatchesPath(session.role, pathname)) {
    return NextResponse.redirect(new URL(getDashboardPath(session.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cashier/:path*", "/staff/:path*", "/partner/:path*", "/sponsor/dashboard/:path*"],
};
