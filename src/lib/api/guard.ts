import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/auth-server';
import { isPathAllowedForRole } from '@/lib/auth';
import { AppRole } from '@/lib/resurgence';
import { forbiddenError, unauthorizedError } from './response';

type LegacyRole = 'ADMIN' | 'SYSTEM' | 'PUBLIC';
export type Role = AppRole | LegacyRole;

export type ApiGuardUser = Awaited<ReturnType<typeof getApiUser>>;

function normalizeRole(role: Role): AppRole | null {
  if (role === 'ADMIN' || role === 'SYSTEM') return 'SYSTEM_ADMIN';
  if (role === 'PUBLIC') return null;
  return role;
}

function normalizeAllowedRoles(roles: Role[]) {
  return roles.map(normalizeRole).filter(Boolean) as AppRole[];
}

export async function getRoleFromRequest(req: NextRequest): Promise<AppRole | null> {
  const user = await getApiUser(req);
  return user?.role ?? null;
}

export async function requireAuth(req: NextRequest): Promise<{ user: NonNullable<ApiGuardUser>; response: null } | { user: null; response: NextResponse }> {
  const user = await getApiUser(req);
  if (!user) {
    return { user: null, response: unauthorizedError() };
  }

  return { user, response: null };
}

export async function requireRole(req: NextRequest, allowed: Role[], options: { adminOverride?: boolean } = {}) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const adminOverride = options.adminOverride ?? true;
  if (adminOverride && user.role === 'SYSTEM_ADMIN') return null;

  const allowedRoles = normalizeAllowedRoles(allowed);
  if (!allowedRoles.includes(user.role)) {
    return forbiddenError();
  }

  return null;
}

export async function requireAnyRole(req: NextRequest, allowed: Role[], options?: { adminOverride?: boolean }) {
  return requireRole(req, allowed, options);
}

export async function requireRoutePermission(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  if (!isPathAllowedForRole(req.nextUrl.pathname, user.role, req.method)) {
    return forbiddenError();
  }

  return null;
}
