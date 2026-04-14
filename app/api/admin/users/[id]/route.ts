import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, any> = {
    name: body.name,
    email: body.email,
    role: body.role,
    status: body.status,
    sponsorId: body.sponsorId || null,
    partnerId: body.partnerId || null
  };

  if (body.password) {
    data.passwordHash = await hashPassword(body.password);
  }

  const item = await db.user.update({
    where: { id },
    data
  });

  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await db.user.delete({ where: { id } });
  return ok({ success: true });
}
