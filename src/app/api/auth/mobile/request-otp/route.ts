import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/passwords';
import { generateOtpCode, mobileSignupRequestSchema } from '@/lib/public-registration';

const otpTtlMinutes = 10;

async function deliverOtp(phoneNumber: string, code: string) {
  const webhookUrl = process.env.SMS_WEBHOOK_URL?.trim();
  const deliveryMode = process.env.OTP_DELIVERY_MODE?.trim().toLowerCase() || (webhookUrl ? 'webhook' : 'demo');

  if (deliveryMode === 'webhook' && webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.SMS_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.SMS_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify({
        to: phoneNumber,
        code,
        message: `Your Resurgence verification code is ${code}. It expires in ${otpTtlMinutes} minutes.`,
      }),
    });

    if (!response.ok) {
      throw new Error('Unable to send OTP through the configured SMS provider.');
    }

    return { mode: 'webhook' as const };
  }

  return { mode: 'demo' as const, code };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = mobileSignupRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid mobile signup details.' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phoneNumber: parsed.data.phoneNumber } });
  if (existing) {
    return NextResponse.json({ error: 'An account already exists for this mobile number. Please log in instead.' }, { status: 409 });
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + otpTtlMinutes * 60 * 1000);
  const delivery = await deliverOtp(parsed.data.phoneNumber, code);

  await prisma.verificationCode.create({
    data: {
      identifier: parsed.data.phoneNumber,
      channel: 'SMS',
      purpose: 'SIGNUP',
      codeHash: hashPassword(code),
      expiresAt,
      payload: {
        displayName: parsed.data.displayName,
        passwordHash: hashPassword(parsed.data.password),
        role: parsed.data.role,
        referralCode: parsed.data.referralCode || '',
        termsAcceptedAt: new Date().toISOString(),
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
