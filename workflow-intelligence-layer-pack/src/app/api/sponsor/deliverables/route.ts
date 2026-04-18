import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SPONSOR, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const sponsorId =
    auth.user?.role === Role.SYSTEM_ADMIN
      ? request.nextUrl.searchParams.get("sponsorId") || auth.user.sponsorId
      : auth.user?.sponsorId;

  if (!sponsorId) return fail("Sponsor profile is not linked.", 400);

  const items = await db.sponsorDeliverable.findMany({
    where: { sponsorId },
    orderBy: { createdAt: "desc" },
  });

  return ok({ items });
}
