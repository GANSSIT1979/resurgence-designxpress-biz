import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { setSessionCookie, signSession } from '@/lib/auth';
import { verifyGoogleCredential } from '@/lib/google-auth';
import { createDashboardWelcomeNotification } from '@/lib/notifications';
import { hashPassword } from '@/lib/passwords';
import { prisma } from '@/lib/prisma';
import { googleLoginSchema, googleSignupSchema } from '@/lib/public-registration';
import { AppRole, roleMeta } from '@/lib/resurgence';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const isLoginIntent = body?.intent === 'login';
  const parsed = isLoginIntent ? googleLoginSchema.safeParse(body) : googleSignupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message || 'Invalid Google authentication details.' },
      { status: 400 },
    );
  }

  try {
    const profile = await verifyGoogleCredential(parsed.data.credential);
    const existing = await prisma.user.findUnique({ where: { email: profile.email } });

    if (existing && !existing.isActive) {
      return NextResponse.json({ ok: false, error: 'This account is inactive. Please contact support.' }, { status: 403 });
    }

    if (!existing && isLoginIntent) {
      return NextResponse.json(
        { ok: false, error: 'No Google account exists for this email yet. Create a new account first.' },
        { status: 404 },
      );
    }

    const signupData = parsed.data as {
      role: AppRole;
      referralCode?: string;
      displayName?: string;
      profileImageUrl?: string;
    };

    const displayName = signupData.displayName?.trim() || profile.displayName;
    const profileImageUrl = signupData.profileImageUrl?.trim() || profile.picture || null;

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            lastLoginAt: new Date(),
            authProvider: 'GOOGLE',
            isEmailVerified: true,
            displayName: isLoginIntent ? existing.displayName : displayName,
            profileImageUrl: existing.profileImageUrl || profileImageUrl,
          },
        })
      : await prisma.user.create({
          data: {
            email: profile.email,
            password: hashPassword(randomUUID()),
            displayName,
            title: roleMeta[signupData.role].label,
            role: signupData.role,
            authProvider: 'GOOGLE',
            isEmailVerified: true,
            profileImageUrl,
            referralCode: signupData.referralCode || null,
            termsAcceptedAt: new Date(),
            lastLoginAt: new Date(),
          },
        });

    if (!existing) {
      await createDashboardWelcomeNotification({
        id: user.id,
        role: user.role,
        displayName: user.displayName,
      }).catch((error) => {
        console.error('[google-signup] welcome notification failed', error);
      });
    }

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
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unable to continue with Google.' },
      { status: 400 },
    );
  }
}
