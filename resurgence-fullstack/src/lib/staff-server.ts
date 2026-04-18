import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { COOKIE_NAME, verifySession } from '@/lib/auth';

export async function getSessionFromCookies() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function getCurrentStaffContext() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'STAFF') return null;

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) return null;

  let staffProfile = await prisma.staffProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: true,
    },
  });

  if (!staffProfile) {
    staffProfile = await prisma.staffProfile.create({
      data: {
        userId: user.id,
        department: 'Operations',
        bio: 'Handles inquiries, schedules, coordination tasks, and internal announcements.',
      },
      include: {
        user: true,
      },
    });
  }

  return { session, user, staffProfile };
}
