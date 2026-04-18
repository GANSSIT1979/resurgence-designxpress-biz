export type SessionUser = {
  id: string;
  email: string;
  role: string;
};

// Replace this with your real auth/session integration.
export async function getCurrentUser(): Promise<SessionUser | null> {
  return null;
}

export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await requireCurrentUser();
  if (user.role !== 'SYSTEM_ADMIN') {
    throw new Error('Forbidden');
  }
  return user;
}
