import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { AppRole, roleMeta, rolePrefixes } from '@/lib/resurgence';
import { getRequiredPermission, hasPermission } from '@/lib/permissions';

export const COOKIE_NAME = 'resurgence_admin_session';
export const SESSION_COOKIE = COOKIE_NAME;

type SessionPayload = {
  email: string;
  role: AppRole;
  displayName?: string;
};

function getJwtSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error('JWT_SECRET is not set');
  }
  return new TextEncoder().encode(value);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifySession(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const role = payload.role;
    if (typeof payload.email !== 'string' || typeof role !== 'string' || !(role in roleMeta)) {
      return null;
    }

    return {
      email: payload.email,
      role: role as AppRole,
      displayName: typeof payload.displayName === 'string' ? payload.displayName : undefined,
    };
  } catch {
    return null;
  }
}

export async function verifyAdminSession(token?: string) {
  const payload = await verifySession(token);
  if (!payload || payload.role !== 'SYSTEM_ADMIN') return null;
  return payload;
}

export async function isAuthenticatedRequest(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = await verifySession(token);
  return Boolean(payload);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@resurgence.local',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
    password: process.env.ADMIN_PASSWORD || '',
  };
}

export function isPathAllowedForRole(pathname: string, role: AppRole, method = 'GET') {
  if (role === 'SYSTEM_ADMIN') return true;

  const requiredPermission = getRequiredPermission(pathname, method);
  if (!requiredPermission) {
    return rolePrefixes[role].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  }

  return hasPermission(role, requiredPermission);
}

export function getLoginRedirect(role: AppRole) {
  return roleMeta[role].defaultRoute;
}

export function getDashboardPath(role: AppRole) {
  return getLoginRedirect(role);
}
