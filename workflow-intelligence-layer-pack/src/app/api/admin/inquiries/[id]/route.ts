import { NextRequest } from "next/server";
import { InquiryStatus, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, requireApiRole } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const item = await db.inquiry.findUnique({ where: { id } });
  if (!item) return fail("Inquiry not found.", 404);

  return ok({ item });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const item = await db.inquiry.update({
    where: { id },
    data: {
      name: body.name ? String(body.name) : undefined,
      email: body.email ? String(body.email) : undefined,
      phone: body.phone === null ? null : body.phone ? String(body.phone) : undefined,
      company: body.company === null ? null : body.company ? String(body.company) : undefined,
      subject: body.subject ? String(body.subject) : undefined,
      message: body.message ? String(body.message) : undefined,
      status: body.status && Object.values(InquiryStatus).includes(body.status) ? body.status : undefined,
    },
  });

  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await db.inquiry.delete({ where: { id } });

  return ok({ deleted: true });
}
