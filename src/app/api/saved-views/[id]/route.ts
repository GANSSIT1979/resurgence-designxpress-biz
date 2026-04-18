import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, requireApiRole } from "@/lib/api-utils";

const allowedRoles = [
  Role.SYSTEM_ADMIN,
  Role.CASHIER,
  Role.SPONSOR,
  Role.STAFF,
  Role.PARTNER,
];

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, allowedRoles);
  if (auth.error) return auth.error;

  const { id } = await params;
  const existing = await db.savedView.findUnique({ where: { id } });
  if (!existing) return fail("Saved view not found.", 404);
  if (existing.userId !== auth.user!.id) return fail("Forbidden.", 403);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const item = await db.savedView.update({
    where: { id },
    data: {
      name: body.name ? String(body.name) : undefined,
      search: body.search === null ? null : body.search ? String(body.search) : undefined,
      status: body.status === null ? null : body.status ? String(body.status) : undefined,
      filtersJson: body.filtersJson === null ? null : body.filtersJson ? String(body.filtersJson) : undefined,
      sortJson: body.sortJson === null ? null : body.sortJson ? String(body.sortJson) : undefined,
    },
  });

  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, allowedRoles);
  if (auth.error) return auth.error;

  const { id } = await params;
  const existing = await db.savedView.findUnique({ where: { id } });
  if (!existing) return fail("Saved view not found.", 404);
  if (existing.userId !== auth.user!.id) return fail("Forbidden.", 403);

  await db.savedView.delete({ where: { id } });
  return ok({ deleted: true });
}
