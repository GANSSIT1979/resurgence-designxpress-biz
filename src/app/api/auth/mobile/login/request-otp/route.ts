import { NextResponse } from 'next/server';
import { deliverMobileOtp, getOtpExpiry } from '@/lib/mobile-otp';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/passwords';
import { generateOtpCode, mobileLoginRequestSchema } from '@/lib/public-registration';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = mobileLoginRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid mobile login details.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { phoneNumber: parsed.data.phoneNumber } });

  if (!user) {
    return NextResponse.json({ error: 'No account exists for this mobile number yet.' }, { status: 404 });
  }

  if (!user.isActive) {
    return NextResponse.json({ error: 'This account is inactive. Please contact support.' }, { status: 403 });
  }

  const code = generateOtpCode();
  const expiresAt = getOtpExpiry();
  const delivery = await deliverMobileOtp(parsed.data.phoneNumber, code);

  await prisma.verificationCode.create({
    data: {
      identifier: parsed.data.phoneNumber,
      channel: 'SMS',
      purpose: 'LOGIN',
      codeHash: hashPassword(code),
      expiresAt,
      payload: {
        userId: user.id,
      },
    },
  });

  return NextResponse.json({
    ok: true,
    expiresAt: expiresAt.toISOString(),
    deliveryMode: delivery.mode,
    ...(delivery.mode === 'demo' ? { demoCode: delivery.code } : {}),
  });
}
