import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { setSessionCookie, signSession } from '@/lib/auth';
import { hashPassword } from '@/lib/passwords';
import { prisma } from '@/lib/prisma';
import { googleSignupSchema, normalizeEmail } from '@/lib/public-registration';
import { AppRole, roleMeta } from '@/lib/resurgence';

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
};

async function verifyGoogleCredential(credential: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Google sign-in is not configured yet. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID in Vercel.');
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Google verification failed. Please try again.');
  }

  const info = (await response.json()) as GoogleTokenInfo;
  const email = normalizeEmail(info.email || '');
  const isVerified = info.email_verified === true || info.email_verified === 'true';

  if (info.aud !== clientId || !email || !isVerified) {
    throw new Error('Google account could not be verified.');
  }

  return {
    email,
    displayName: info.name || email.split('@')[0],
    picture: info.picture || '',
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = googleSignupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid Google signup details.' }, { status: 400 });
  }

  try {
    const profile = await verifyGoogleCredential(parsed.data.credential);
    const existing = await prisma.user.findUnique({ where: { email: profile.email } });

    if (existing && !existing.isActive) {
      return NextResponse.json({ error: 'This account is inactive. Please contact support.' }, { status: 403 });
    }

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            lastLoginAt: new Date(),
            isEmailVerified: true,
            profileImageUrl: existing.profileImageUrl || profile.picture || null,
          },
        })
      : await prisma.user.create({
          data: {
            email: profile.email,
            password: hashPassword(randomUUID()),
            displayName: profile.displayName,
            title: roleMeta[parsed.data.role].label,
            role: parsed.data.role,
            authProvider: 'GOOGLE',
            isEmailVerified: true,
            profileImageUrl: profile.picture || null,
            referralCode: parsed.data.referralCode || null,
            termsAcceptedAt: new Date(),
            lastLoginAt: new Date(),
          },
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
      existingAccount: Boolean(existing),
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to continue with Google.' }, { status: 400 });
  }
}
