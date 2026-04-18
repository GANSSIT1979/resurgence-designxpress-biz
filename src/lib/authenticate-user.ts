import { AppRole, roleMeta } from '@/lib/resurgence';
import { getAdminCredentials } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, isPasswordHash, verifyPassword } from '@/lib/passwords';

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const seededUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (seededUser && seededUser.isActive && verifyPassword(password, seededUser.password)) {
    const passwordHash = isPasswordHash(seededUser.password) ? seededUser.password : hashPassword(password);
    await prisma.user.update({
      where: { id: seededUser.id },
      data: {
        password: passwordHash,
        lastLoginAt: new Date(),
      },
    });

    return {
      email: seededUser.email,
      role: seededUser.role as AppRole,
      displayName: seededUser.displayName,
      redirectTo: roleMeta[seededUser.role as AppRole].defaultRoute,
    };
  }

  const credentials = getAdminCredentials();
  const adminMatches =
    normalizedEmail === credentials.email.toLowerCase() &&
    ((credentials.passwordHash && verifyPassword(password, credentials.passwordHash)) ||
      (!credentials.passwordHash && credentials.password && credentials.password === password));

  if (adminMatches) {
    return {
      email: credentials.email,
      role: 'SYSTEM_ADMIN' as AppRole,
      displayName: 'System Administrator',
      redirectTo: '/admin',
    };
  }

  return null;
}

