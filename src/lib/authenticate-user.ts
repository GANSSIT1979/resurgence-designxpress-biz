import { AppRole, roleMeta } from '@/lib/resurgence';
import { getAdminCredentials } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, isPasswordHash, verifyPassword } from '@/lib/passwords';
import { normalizePhoneNumber } from '@/lib/public-registration';

export async function authenticateUser(identifier: string, password: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const normalizedPhone = normalizePhoneNumber(identifier);

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedIdentifier },
        ...(normalizedPhone ? [{ phoneNumber: normalizedPhone }] : []),
      ],
    },
  });

  if (user && user.isActive && verifyPassword(password, user.password)) {
    const passwordHash = isPasswordHash(user.password) ? user.password : hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        lastLoginAt: new Date(),
      },
    });

    return {
      email: user.email,
      role: user.role as AppRole,
      displayName: user.displayName,
      redirectTo: roleMeta[user.role as AppRole].defaultRoute,
    };
  }

  const credentials = getAdminCredentials();
  const adminMatches =
    normalizedIdentifier === credentials.email.toLowerCase() &&
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
