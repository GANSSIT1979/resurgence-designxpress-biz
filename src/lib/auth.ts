import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "resurgence_session";

export type AppRole =
  | "SYSTEM_ADMIN"
  | "CASHIER"
  | "SPONSOR"
  | "STAFF"
  | "PARTNER";

type JwtPayload = {
  userId: string;
  role: AppRole;
  email: string;
};

export type ApiUser = {
  id: string;
  email: string;
  role: AppRole;
  sponsorId: string | null;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return secret;
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
    default:
      return "/login";
  }
}

function isUserActive(user: Record<string, unknown>) {
  if ("isActive" in user && user.isActive === false) return false;
  if ("active" in user && user.active === false) return false;
  if ("status" in user && typeof user.status === "string" && user.status.toUpperCase() === "INACTIVE") {
    return false;
  }
  return true;
}

function mapUserRecord(candidate: Record<string, unknown>, fallback?: Partial<JwtPayload>): ApiUser {
  return {
    id: String(candidate.id ?? fallback?.userId ?? ""),
    email: String(candidate.email ?? fallback?.email ?? ""),
    role: String(candidate.role ?? fallback?.role ?? "STAFF") as AppRole,
    sponsorId:
      typeof candidate.sponsorId === "string"
        ? candidate.sponsorId
        : candidate.sponsorId == null
          ? null
          : String(candidate.sponsorId),
  };
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

export async function hashPassword(password: string) {
  const bcryptModule = await import("bcryptjs");
  const bcrypt = bcryptModule.default;
  return bcrypt.hash(password, 10);
}

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const [{ db }, bcryptModule] = await Promise.all([
    import("./db"),
    import("bcryptjs"),
  ]);

  const bcrypt = bcryptModule.default;

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) return null;

  const candidate = user as unknown as Record<string, unknown>;
  if (!isUserActive(candidate)) return null;

  const passwordHash =
    typeof candidate.passwordHash === "string"
      ? candidate.passwordHash
      : typeof candidate.password === "string"
        ? candidate.password
        : "";

  if (!passwordHash) return null;

  const passwordOk = await bcrypt.compare(password, passwordHash);
  if (!passwordOk) return null;

  return mapUserRecord(candidate, {
    email: normalizedEmail,
    role: String(candidate.role) as AppRole,
    userId: String(candidate.id),
  });
}

export async function getCurrentUser() {
  const [{ cookies }, { db }] = await Promise.all([
    import("next/headers"),
    import("./db"),
  ]);

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const decoded = verifySession(token);
  if (!decoded) return null;

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) return null;

  const candidate = user as unknown as Record<string, unknown>;
  if (!isUserActive(candidate)) return null;

  return mapUserRecord(candidate, decoded);
}

export async function getApiUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const decoded = verifySession(token);
  if (!decoded) return null;

  const { db } = await import("./db");

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) return null;

  const candidate = user as unknown as Record<string, unknown>;
  if (!isUserActive(candidate)) return null;

  return mapUserRecord(candidate, decoded);
}
