import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { COOKIE_NAME, verifySession } from '@/lib/auth';

export async function getSessionFromCookies() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function getCurrentPartnerContext() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'PARTNER') return null;

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) return null;

  let partnerProfile = await prisma.partnerProfile.findUnique({
    where: { userId: user.id },
    include: {
      partner: true,
      campaigns: true,
      referrals: true,
      agreements: true,
    },
  });

  if (!partnerProfile) {
    partnerProfile = await prisma.partnerProfile.create({
      data: {
        userId: user.id,
        companyName: user.displayName || 'Partner Account',
        contactName: user.displayName || 'Partner Contact',
        contactEmail: user.email,
      },
      include: {
        partner: true,
        campaigns: true,
        referrals: true,
        agreements: true,
      },
    });
  }

  return { session, user, partnerProfile };
}
