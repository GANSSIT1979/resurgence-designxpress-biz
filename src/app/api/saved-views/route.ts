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

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, allowedRoles);
  if (auth.error) return auth.error;

  const scope = request.nextUrl.searchParams.get("scope");
  if (!scope) return fail("Scope is required.", 400);

  const items = await db.savedView.findMany({
    where: {
      userId: auth.user!.id,
      scope,
    },
    orderBy: { updatedAt: "desc" },
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, allowedRoles);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const scope = String(body.scope || "").trim();
  const name = String(body.name || "").trim();

  if (!scope || !name) return fail("Scope and name are required.", 400);

  const item = await db.savedView.create({
    data: {
      userId: auth.user!.id,
      scope,
      name,
      search: body.search ? String(body.search) : null,
      status: body.status ? String(body.status) : null,
      filtersJson: body.filtersJson ? String(body.filtersJson) : null,
      sortJson: body.sortJson ? String(body.sortJson) : null,
    },
  });

  return ok({ item }, 201);
}
