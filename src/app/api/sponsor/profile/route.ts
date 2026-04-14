import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, requireApiRole } from "@/lib/api-utils";

function resolveSponsorId(request: NextRequest, authUser?: { role?: Role; sponsorId?: string | null }) {
  if (authUser?.role === Role.SYSTEM_ADMIN) {
    const sponsorIdFromQuery = request.nextUrl.searchParams.get("sponsorId");
    return sponsorIdFromQuery || authUser.sponsorId || null;
  }

  return authUser?.sponsorId || null;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SPONSOR, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const sponsorId = resolveSponsorId(request, auth.user);
  if (!sponsorId) {
    return fail("Sponsor profile is not linked.", 400);
  }

  const sponsor = await db.sponsor.findUnique({
    where: { id: sponsorId },
    include: { profile: true },
  });

  if (!sponsor) {
    return fail("Sponsor record not found.", 404);
  }

  return ok({
    item: sponsor.profile
      ? sponsor.profile
      : {
          sponsorId: sponsor.id,
          packageId: sponsor.packageId,
          headline: null,
          description: sponsor.description || "",
          contactName: "Sponsor Contact",
          contactEmail: "sponsor@example.com",
          logo: sponsor.logo || null,
        },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SPONSOR, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const sponsorId = resolveSponsorId(request, auth.user);
  if (!sponsorId) {
    return fail("Sponsor profile is not linked.", 400);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return fail("Invalid request body.", 400);
  }

  const sponsor = await db.sponsor.findUnique({
    where: { id: sponsorId },
  });

  if (!sponsor) {
    return fail("Sponsor record not found.", 404);
  }

  const item = await db.sponsorProfile.upsert({
    where: { sponsorId: sponsor.id },
    update: {
      headline: typeof body.headline === "string" ? body.headline : null,
      description:
        typeof body.description === "string" && body.description.trim()
          ? body.description
          : sponsor.description || "",
      contactName:
        typeof body.contactName === "string" && body.contactName.trim()
          ? body.contactName
          : "Sponsor Contact",
      contactEmail:
        typeof body.contactEmail === "string" && body.contactEmail.trim()
          ? body.contactEmail
          : "sponsor@example.com",
      logo:
        typeof body.logo === "string" && body.logo.trim()
          ? body.logo
          : null,
    },
    create: {
      sponsorId: sponsor.id,
      packageId: sponsor.packageId,
      headline: typeof body.headline === "string" ? body.headline : null,
      description:
        typeof body.description === "string" && body.description.trim()
          ? body.description
          : sponsor.description || "",
      contactName:
        typeof body.contactName === "string" && body.contactName.trim()
          ? body.contactName
          : "Sponsor Contact",
      contactEmail:
        typeof body.contactEmail === "string" && body.contactEmail.trim()
          ? body.contactEmail
          : "sponsor@example.com",
      logo:
        typeof body.logo === "string" && body.logo.trim()
          ? body.logo
          : sponsor.logo || null,
    },
  });

  return ok({ item });
}