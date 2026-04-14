import { NextRequest } from "next/server";
import { Role, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      sponsorId: true,
      partnerId: true,
      createdAt: true
    }
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const passwordHash = await hashPassword(body.password || "ChangeMe123!");

  const item = await db.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role,
      status: body.status || UserStatus.ACTIVE,
      sponsorId: body.sponsorId || null,
      partnerId: body.partnerId || null
    }
  });

  return ok({ item });
}
