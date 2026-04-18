import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { COOKIE_NAME, verifySession } from '@/lib/auth';

export async function getSessionFromCookies() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function getCurrentSponsorContext() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'SPONSOR') return null;

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) return null;

  let sponsorProfile = await prisma.sponsorProfile.findUnique({
    where: { userId: user.id },
    include: {
      sponsor: true,
      preferredPackage: true,
    },
  });

  if (!sponsorProfile) {
    sponsorProfile = await prisma.sponsorProfile.create({
      data: {
        userId: user.id,
        companyName: user.displayName || 'Sponsor Account',
        contactName: user.displayName || 'Sponsor Contact',
        contactEmail: user.email,
      },
      include: {
        sponsor: true,
        preferredPackage: true,
      },
    });
  }

  return { session, user, sponsorProfile };
}

export function buildSponsorInvoiceWhere(profile: { sponsorId: string | null; companyName: string; contactEmail: string }) {
  const email = profile.contactEmail.trim();
  const companyName = profile.companyName.trim();
  const clauses: Array<Record<string, string>> = [];

  if (profile.sponsorId) clauses.push({ sponsorId: profile.sponsorId });
  if (companyName) clauses.push({ companyName });
  if (email) clauses.push({ email });

  return { OR: clauses };
}
