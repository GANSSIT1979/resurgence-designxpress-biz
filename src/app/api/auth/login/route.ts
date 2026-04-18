import { NextResponse } from 'next/server';
import { setSessionCookie, signSession } from '@/lib/auth';
import { authenticateUser } from '@/lib/authenticate-user';

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

  const response = NextResponse.json({ ok: true, redirectTo: user.redirectTo, role: user.role });
  setSessionCookie(response, token);
  return response;
}
