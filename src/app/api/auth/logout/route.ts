<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  clearSessionCookie(response);
  return response;
}
=======
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "../../../../lib/auth";

export async function POST() {
  const res = NextResponse.redirect(new URL("/", "http://localhost:3000"));

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
>>>>>>> parent of d975526 (commit)
