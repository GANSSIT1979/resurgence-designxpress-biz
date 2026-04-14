import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { parsePayload } from "@/lib/parse";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await (db as any).creatorProfile.findMany({
    orderBy: { createdAt: "desc" }
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const data = parsePayload(body);
  const item = await (db as any).creatorProfile.create({ data });
  return ok({ item });
}
