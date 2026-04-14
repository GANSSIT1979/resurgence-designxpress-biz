import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, getDashboardPath, signSession, verifyPassword } from "@/lib/auth";
import { UserStatus } from "@prisma/client";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  let email = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    email = String(body.email || "").trim().toLowerCase();
    password = String(body.password || "");
  } else {
    const form = await request.formData();
    email = String(form.get("email") || "").trim().toLowerCase();
    password = String(form.get("password") || "");
  }

  if (!email || !password) {
    return redirectTo(request, "/login?error=invalid");
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user || user.status !== UserStatus.ACTIVE) {
    return redirectTo(request, "/login?error=invalid");
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return redirectTo(request, "/login?error=invalid");
  }

  const token = signSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sponsorId: user.sponsorId,
    partnerId: user.partnerId
  });

  const next = request.nextUrl.searchParams.get("next");
  const redirectUrl = next || getDashboardPath(user.role);

  const response = NextResponse.redirect(new URL(redirectUrl, request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
