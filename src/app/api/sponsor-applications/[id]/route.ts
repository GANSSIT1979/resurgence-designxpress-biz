import { NextRequest } from "next/server";
import { Role, SubmissionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, requireApiRole } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const item = await db.sponsorApplication.update({
    where: { id },
    data: {
      sponsorName: body.sponsorName ? String(body.sponsorName) : undefined,
      contactName: body.contactName ? String(body.contactName) : undefined,
      email: body.email ? String(body.email) : undefined,
      phone: body.phone === null ? null : body.phone ? String(body.phone) : undefined,
      company: body.company === null ? null : body.company ? String(body.company) : undefined,
      packageInterest: body.packageInterest ? String(body.packageInterest) : undefined,
      message: body.message ? String(body.message) : undefined,
      status: body.status && Object.values(SubmissionStatus).includes(body.status) ? body.status : undefined,
      sponsorId: body.sponsorId === null ? null : body.sponsorId ? String(body.sponsorId) : undefined,
    },
  });

  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;
  const { id } = await params;
  await db.sponsorApplication.delete({ where: { id } });
  return ok({ deleted: true });
}
