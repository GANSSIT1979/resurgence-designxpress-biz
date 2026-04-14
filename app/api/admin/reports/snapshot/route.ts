import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const type = body.type || "overview";

  const payload = {
    inquiries: await db.inquiry.count(),
    sponsors: await db.sponsor.count(),
    creatorProfiles: await db.creatorProfile.count(),
    sponsorApplications: await db.sponsorApplication.count(),
    invoices: await db.invoice.count(),
    receipts: await db.receipt.count()
  };

  await db.reportSnapshot.create({
    data: {
      type,
      name: `${type} snapshot`,
      payload
    }
  });

  return ok({ success: true, message: "Snapshot saved." });
}
