import { NextResponse } from 'next/server';
import { setSessionCookie, signSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/passwords';
import { AppRole, roleMeta } from '@/lib/resurgence';
import { mobileOtpVerifySchema, phoneNumberToSyntheticEmail } from '@/lib/public-registration';

type MobileSignupPayload = {
  displayName?: string;
  passwordHash?: string;
  role?: AppRole;
  referralCode?: string;
  termsAcceptedAt?: string;
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
      purpose: 'SIGNUP',
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

  const payload = (verification.payload || {}) as MobileSignupPayload;
  const role = payload.role && roleMeta[payload.role] ? payload.role : 'MEMBER';
  const email = phoneNumberToSyntheticEmail(parsed.data.phoneNumber);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { phoneNumber: parsed.data.phoneNumber },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ error: 'An account already exists for this mobile number. Please log in instead.' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      phoneNumber: parsed.data.phoneNumber,
      password: payload.passwordHash || '',
      displayName: payload.displayName || 'Resurgence Member',
      title: roleMeta[role].label,
      role,
      authProvider: 'MOBILE',
      isPhoneVerified: true,
      isEmailVerified: false,
      referralCode: payload.referralCode || null,
      termsAcceptedAt: payload.termsAcceptedAt ? new Date(payload.termsAcceptedAt) : new Date(),
      lastLoginAt: new Date(),
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
