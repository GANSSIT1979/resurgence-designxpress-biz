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