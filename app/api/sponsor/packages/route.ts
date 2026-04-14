import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";

export async function GET(_request: NextRequest) {
  const items = await db.sponsorPackage.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" }
  });

  return ok({ items });
}
