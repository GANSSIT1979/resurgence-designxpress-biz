import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getServerSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function getCurrentSessionUser() {
  const session = await getServerSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.email },
  });

  if (!user) return null;
  return { session, user };
}

