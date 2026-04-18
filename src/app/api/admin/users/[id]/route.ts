import { NextRequest, NextResponse } from "next/server";
import { Role, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getApiUser, hashPassword } from "@/lib/auth";

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  sponsorId?: string | null;
  partnerId?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  sponsor?: { id: string; name: string } | null;
  partner?: { id: string; name: string } | null;
};

const ALLOWED_ROLES = new Set<string>([
  "SYSTEM_ADMIN",
  "CASHIER",
  "SPONSOR",
  "STAFF",
  "PARTNER",
  "CREATOR",
]);

const ALLOWED_STATUSES = new Set<string>(["ACTIVE", "INACTIVE"]);

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return asString(value).toLowerCase();
}

function serializeUser(item: UserRecord | null) {
  if (!item) return null;

  return {
    ...item,
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : item.createdAt ?? null,
    updatedAt:
      item.updatedAt instanceof Date
        ? item.updatedAt.toISOString()
        : item.updatedAt ?? null,
  };
}

async function requireAdmin(request: NextRequest) {
  const actor = await getApiUser(request);

  if (!actor) {
    return { actor: null, error: json({ error: "Unauthorized." }, 401) };
  }

  if (actor.role !== "SYSTEM_ADMIN") {
    return { actor, error: json({ error: "Forbidden." }, 403) };
  }

  return { actor, error: null };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;

    const item = await db.user.findUnique({
      where: { id },
      include: {
        sponsor: {
          select: { id: true, name: true },
        },
        partner: {
          select: { id: true, name: true },
        },
      },
    });

    if (!item) {
      return json({ error: "User not found." }, 404);
    }

    return json({
      item: serializeUser(item as unknown as UserRecord),
    });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return json({ error: "Unable to load user." }, 500);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;

    const existing = await db.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return json({ error: "User not found." }, 404);
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!body) {
      return json({ error: "Invalid request body." }, 400);
    }

    const name = asString(body.name);
    const email = normalizeEmail(body.email);
    const password = asString(body.password);
    const role = asString(body.role);
    const status = asString(body.status);
    const sponsorId = asString(body.sponsorId) || null;
    const partnerId = asString(body.partnerId) || null;

    if (!name || !email || !role || !status) {
      return json(
        { error: "Name, email, role, and status are required." },
        400,
      );
    }

    if (!ALLOWED_ROLES.has(role)) {
      return json({ error: "Invalid role." }, 400);
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return json({ error: "Invalid status." }, 400);
    }

    const emailOwner = await db.user.findUnique({
      where: { email },
    });

    if (emailOwner && emailOwner.id !== id) {
      return json({ error: "A user with this email already exists." }, 409);
    }

    if (auth.actor?.id === id && status === "INACTIVE") {
      return json(
        { error: "You cannot deactivate your current account." },
        400,
      );
    }

    const item = await db.user.update({
      where: { id },
      data: {
        name,
        email,
        role: role as Role,
        status: status as UserStatus,
        sponsorId,
        partnerId,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
      include: {
        sponsor: {
          select: { id: true, name: true },
        },
        partner: {
          select: { id: true, name: true },
        },
      },
    });

    return json({
      item: serializeUser(item as unknown as UserRecord),
    });
  } catch (error) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return json({ error: "Unable to update user." }, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params;

    const existing = await db.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return json({ error: "User not found." }, 404);
    }

    if (auth.actor?.id === id) {
      return json(
        { error: "You cannot delete your current account." },
        400,
      );
    }

    await db.user.delete({
      where: { id },
    });

    return json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return json({ error: "Unable to delete user." }, 500);
  }
}
