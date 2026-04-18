<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { setSessionCookie, signSession } from '@/lib/auth';
import { authenticateUser } from '@/lib/authenticate-user';
=======
import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  getDashboardPath,
  SESSION_COOKIE,
  signSession,
} from "../../../../lib/auth";
>>>>>>> parent of d975526 (commit)

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid account credentials.' }, { status: 401 });
  }

  const token = await signSession({
    email: user.email,
    role: user.role,
    displayName: user.displayName,
  });

  const response = NextResponse.json({ success: true, redirectTo: user.redirectTo, role: user.role });
  setSessionCookie(response, token);
  return response;
}
<<<<<<< HEAD
=======

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const next = typeof body?.next === "string" ? body.next : null;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = signSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const redirectTo = safeRedirectTarget(next, user.role);

    const res = NextResponse.json({
      ok: true,
      redirectTo,
      role: user.role,
    });

    res.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to login right now." },
      { status: 500 }
    );
  }
}
>>>>>>> parent of d975526 (commit)
