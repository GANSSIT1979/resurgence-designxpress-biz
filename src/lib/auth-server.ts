import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppRole } from '@/lib/resurgence';
import { COOKIE_NAME, verifySession } from '@/lib/auth';

type SessionUser = {
  id: string;
  email: string;
  role: AppRole;
  displayName: string;
  sponsorId: string | null;
  sponsorProfileId: string | null;
  partnerId: string | null;
  partnerProfileId: string | null;
  staffProfileId: string | null;
};

async function resolveSessionUser(token?: string): Promise<SessionUser | null> {
  const session = await verifySession(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    include: {
      sponsorProfile: { select: { id: true, sponsorId: true } },
      partnerProfile: { select: { id: true, partnerId: true } },
      staffProfile: { select: { id: true } },
    },
  });

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role as AppRole,
    displayName: user.displayName,
    sponsorId: user.sponsorProfile?.sponsorId ?? null,
    sponsorProfileId: user.sponsorProfile?.id ?? null,
    partnerId: user.partnerProfile?.partnerId ?? null,
    partnerProfileId: user.partnerProfile?.id ?? null,
    staffProfileId: user.staffProfile?.id ?? null,
  };
}

export async function getApiUser(request: NextRequest) {
  return resolveSessionUser(request.cookies.get(COOKIE_NAME)?.value);
}

export async function getCurrentUser() {
  const store = await cookies();
  return resolveSessionUser(store.get(COOKIE_NAME)?.value);
}
