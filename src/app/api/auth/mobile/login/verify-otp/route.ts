import { NextResponse } from 'next/server';
import { setSessionCookie, signSession } from '@/lib/auth';
import { verifyPassword } from '@/lib/passwords';
import { prisma } from '@/lib/prisma';
import { AppRole, roleMeta } from '@/lib/resurgence';
import { mobileOtpVerifySchema } from '@/lib/public-registration';

type MobileLoginPayload = {
  userId?: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = mobileOtpVerifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid verification code.' }, { status: 400 });
  }

  const verification = await prisma.verificationCode.findFirst({
    where: {
      identifier: parsed.data.phoneNumber,
      purpose: 'LOGIN',
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) {
    return NextResponse.json({ error: 'Verification code expired or was not requested. Please request a new code.' }, { status: 400 });
  }

  if (verification.attempts >= 5) {
    return NextResponse.json({ error: 'Too many attempts. Please request a new verification code.' }, { status: 429 });
  }

  if (!verifyPassword(parsed.data.code, verification.codeHash)) {
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json({ error: 'Incorrect verification code.' }, { status: 400 });
  }

  const payload = (verification.payload || {}) as MobileLoginPayload;
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: payload.userId || '' },
        { phoneNumber: parsed.data.phoneNumber },
      ],
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'This mobile account is unavailable. Please contact support.' }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      isPhoneVerified: true,
    },
  });

  await prisma.verificationCode.update({
    where: { id: verification.id },
    data: { consumedAt: new Date() },
  });

  const token = await signSession({
    email: user.email,
    role: user.role as AppRole,
    displayName: user.displayName,
  });

  const response = NextResponse.json({
    ok: true,
    role: user.role,
    redirectTo: roleMeta[user.role as AppRole].defaultRoute,
  });
  setSessionCookie(response, token);
  return response;
}
