import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth-server";

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (value && typeof value === "object") {
    const maybeDecimal = value as { toString?: () => string; constructor?: { name?: string } };
    if (maybeDecimal.constructor?.name === "Decimal") {
      return maybeDecimal.toString ? maybeDecimal.toString() : String(value);
    }

    const output: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
      output[key] = normalizeValue(inner);
    }
    return output;
  }

  return value;
}

export function ok(payload: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json(normalizeValue({ ok: true, ...payload }), { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function requireApiRole(request: NextRequest, roles: UserRole[]) {
  const user = await getApiUser(request);

  if (!user) {
    return { error: fail("Unauthorized.", 401), user: null };
  }

  if (!roles.includes(user.role as UserRole)) {
    return { error: fail("Forbidden.", 403), user };
  }

  return { error: null, user };
}

export function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

export function parseNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function parseOptionalDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}
