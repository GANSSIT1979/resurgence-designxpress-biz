import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "resurgence_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AppRole =
  | "SYSTEM_ADMIN"
  | "CASHIER"
  | "SPONSOR"
  | "STAFF"
  | "PARTNER"
  | "CREATOR";

type JwtPayload = {
  userId: string;
  role: AppRole;
  email: string;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return secret;
}

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function isUserActive(user: Record<string, unknown>) {
  if ("isActive" in user && user.isActive === false) return false;
  if ("active" in user && user.active === false) return false;

  if (
    "status" in user &&
    typeof user.status === "string" &&
    user.status.toUpperCase() === "INACTIVE"
  ) {
    return false;
  }

  return true;
}

export function getDashboardPath(role: string) {
  switch (role) {
    case "SYSTEM_ADMIN":
      return "/admin";
    case "CASHIER":
      return "/cashier";
    case "SPONSOR":
      return "/sponsor/dashboard";
    case "STAFF":
      return "/staff";
    case "PARTNER":
      return "/partner";
    case "CREATOR":
      return "/creator/dashboard";
    default:
      return "/login";
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signSession(payload: JwtPayload) {
  return jwt.sign(payload, getAuthSecret(), {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifySession(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getAuthSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

function extractStoredPassword(candidate: Record<string, unknown>) {
  if (typeof candidate.passwordHash === "string" && candidate.passwordHash) {
    return candidate.passwordHash;
  }

  if (typeof candidate.password === "string" && candidate.password) {
    return candidate.password;
  }

  return "";
}

async function findUserByIdentifier(identifier: string) {
  const normalized = normalizeIdentifier(identifier);

  const user = await (db.user as any).findFirst({
    where: {
      email: normalized,
    },
  });

  return user as Record<string, unknown> | null;
}

export async function authenticateUser(identifier: string, password: string) {
  const normalized = normalizeIdentifier(identifier);
  const user = await findUserByIdentifier(normalized);

  if (!user) return null;
  if (!isUserActive(user)) return null;

  const passwordHash = extractStoredPassword(user);
  if (!passwordHash) return null;

  const passwordOk = await verifyPassword(password, passwordHash);
  if (!passwordOk) return null;

  return {
    id: String(user.id),
    email: String(user.email ?? normalized),
    role: String(user.role) as AppRole,
  };
}

async function getUserBySessionPayload(payload: JwtPayload | null) {
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) return null;

  const candidate = user as unknown as Record<string, unknown>;
  if (!isUserActive(candidate)) return null;

  return {
    id: String(candidate.id),
    email: String(candidate.email ?? payload.email),
    role: String(candidate.role ?? payload.role) as AppRole,
    name:
      typeof candidate.name === "string"
        ? candidate.name
        : typeof candidate.displayName === "string"
          ? candidate.displayName
          : "",
  };
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const decoded = verifySession(token);
  return getUserBySessionPayload(decoded);
}

export async function getApiUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const decoded = verifySession(token);
  return getUserBySessionPayload(decoded);
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return res;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}