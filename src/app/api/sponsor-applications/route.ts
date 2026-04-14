import { NextRequest } from "next/server";
import { Role, SubmissionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, requireApiRole } from "@/lib/api-utils";
import { getApiUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN, Role.SPONSOR]);
  if (auth.error) return auth.error;

  const where =
    auth.user?.role === Role.SPONSOR && auth.user?.sponsorId
      ? { sponsorId: auth.user.sponsorId }
      : {};

  const items = await db.sponsorApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const maybeUser = await getApiUser(request);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const sponsorName = String(body.sponsorName || "").trim();
  const contactName = String(body.contactName || "").trim();
  const email = String(body.email || "").trim();
  const packageInterest = String(body.packageInterest || "").trim();
  const message = String(body.message || "").trim();

  if (!sponsorName || !contactName || !email || !packageInterest || !message) {
    return fail("Sponsor name, contact name, email, package interest, and message are required.", 400);
  }

  const item = await db.sponsorApplication.create({
    data: {
      sponsorName,
      contactName,
      email,
      phone: body.phone ? String(body.phone) : null,
      company: body.company ? String(body.company) : null,
      packageInterest,
      message,
      status: body.status && Object.values(SubmissionStatus).includes(body.status) ? body.status : SubmissionStatus.NEW,
      sponsorId: maybeUser?.sponsorId || (body.sponsorId ? String(body.sponsorId) : null),
    },
  });

  return ok({ item }, 201);
}
