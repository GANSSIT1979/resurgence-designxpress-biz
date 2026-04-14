import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SPONSOR, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  if (!auth.user?.sponsorId && auth.user?.role !== Role.SYSTEM_ADMIN) {
    return fail("Sponsor profile is not linked.", 400);
  }

  const item = await db.sponsorProfile.findUnique({
    where: { sponsorId: auth.user?.sponsorId || "" }
  });

  return ok({ item });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SPONSOR, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const sponsorId = auth.user?.sponsorId;
  if (!sponsorId && auth.user?.role !== Role.SYSTEM_ADMIN) {
    return fail("Sponsor profile is not linked.", 400);
  }

  const body = await request.json();

  const sponsor = await db.sponsor.findUnique({ where: { id: sponsorId || "" } });
  if (!sponsor) return fail("Sponsor record not found.", 404);

  const item = await db.sponsorProfile.upsert({
    where: { sponsorId: sponsor.id },
    update: {
      headline: body.headline || null,
      description: body.description || sponsor.description,
      contactName: body.contactName || "Sponsor Contact",
      contactEmail: body.contactEmail || "sponsor@example.com",
      logo: body.logo || null
    },
    create: {
      sponsorId: sponsor.id,
      packageId: sponsor.packageId,
      headline: body.headline || null,
      description: body.description || sponsor.description,
      contactName: body.contactName || "Sponsor Contact",
      contactEmail: body.contactEmail || "sponsor@example.com",
      logo: body.logo || sponsor.logo || null
    }
  });

  return ok({ item });
}
