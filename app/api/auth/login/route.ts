import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, getDashboardPath, SESSION_COOKIE, signSession } from "@/lib/auth";

function safeRedirectTarget(nextValue: string | null, role: string) {
  if (!nextValue || !nextValue.startsWith("/")) {
    return getDashboardPath(role);
  }

  if (nextValue.startsWith("//") || nextValue.startsWith("/api/")) {
    return getDashboardPath(role);
  }

  return nextValue;
}

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
