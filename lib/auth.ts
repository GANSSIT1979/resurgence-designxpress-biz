import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { Role, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "resurgence_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  sponsorId?: string | null;
  partnerId?: string | null;
};

type TokenPayload = SessionUser & { iat?: number; exp?: number };

function getSecret() {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

export function getDashboardPath(role: Role) {
  return role === "SYSTEM_ADMIN"
    ? "/admin"
    : role === "CASHIER"
      ? "/cashier"
      : role === "SPONSOR"
        ? "/sponsor/dashboard"
        : role === "PARTNER"
          ? "/partner"
          : "/staff";
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(user: SessionUser) {
  return jwt.sign(user, getSecret(), { algorithm: "HS256", expiresIn: "7d" });
}

export function verifySession(token: string): SessionUser | null {
  try {
    return jwt.verify(token, getSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

async function validateSessionUser(sessionUser: SessionUser | null): Promise<SessionUser | null> {
  if (!sessionUser) return null;

  const dbUser = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sponsorId: true,
      partnerId: true,
      status: true
    }
  });

  if (!dbUser || dbUser.status !== UserStatus.ACTIVE) {
    return null;
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    sponsorId: dbUser.sponsorId,
    partnerId: dbUser.partnerId
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return validateSessionUser(verifySession(token));
}

export async function requireUser(roles?: Role[]) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    throw new Error("Unauthorized");
  }
  if (roles && !roles.includes(sessionUser.role)) {
    throw new Error("Forbidden");
  }

  return sessionUser;
}

export async function getApiUser(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return validateSessionUser(verifySession(token));
}
