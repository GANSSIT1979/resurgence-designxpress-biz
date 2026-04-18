import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SPONSOR, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const where =
    auth.user?.role === Role.SPONSOR && auth.user.sponsorId
      ? { sponsorId: auth.user.sponsorId }
      : auth.user?.role === Role.SYSTEM_ADMIN && request.nextUrl.searchParams.get("sponsorId")
        ? { sponsorId: request.nextUrl.searchParams.get("sponsorId") || undefined }
        : {};

  const items = await db.sponsorApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return ok({ items });
}
