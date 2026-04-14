import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SPONSOR, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const sponsorId = auth.user?.sponsorId;
  const where =
    auth.user?.role === Role.SYSTEM_ADMIN ? {} : { sponsorId: sponsorId || "__none__" };

  const items = await db.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  return ok({ items });
}
