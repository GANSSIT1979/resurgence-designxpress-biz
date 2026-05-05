import { normalizeEmail } from '@/lib/public-registration';

export type VerifiedGoogleProfile = {
  email: string;
  displayName: string;
  picture: string;
  subject: string;
};

type GoogleTokenInfo = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
};

export async function verifyGoogleCredential(credential: string): Promise<VerifiedGoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('Google sign-in is not configured yet. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID in Vercel.');
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

  if (info.aud !== clientId || !info.sub || !email || !isVerified) {
    throw new Error('Google account could not be verified.');
  }

  return {
    subject: info.sub,
    email,
    displayName: info.name || email.split('@')[0],
    picture: info.picture || '',
  };
}
