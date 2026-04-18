import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

function buildRedirectResponse(request: Request) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";

  const res = NextResponse.redirect(new URL(redirectTo, url.origin));

  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}

export async function POST(request: Request) {
  await logActivity({
    request,
    action: "LOGOUT",
    resource: "auth",
  });

  return buildRedirectResponse(request);
}

export async function GET(request: Request) {
  await logActivity({
    request,
    action: "LOGOUT",
    resource: "auth",
  });

  return buildRedirectResponse(request);
}