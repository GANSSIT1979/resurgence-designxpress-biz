import { NextRequest } from "next/server";
import { InvoiceStatus, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, parseNumber, parseOptionalDate, requireApiRole } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const item = await db.invoice.findUnique({ where: { id } });
  if (!item) return fail("Invoice not found.", 404);

  return ok({ item });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const item = await db.invoice.update({
    where: { id },
    data: {
      number: body.number === null ? null : body.number ? String(body.number) : undefined,
      sponsorId: body.sponsorId === null ? null : body.sponsorId ? String(body.sponsorId) : undefined,
      customerName: body.customerName ? String(body.customerName) : undefined,
      issuedAt: body.issuedAt === null ? null : body.issuedAt ? parseOptionalDate(body.issuedAt) || undefined : undefined,
      dueDate: body.dueDate === null ? null : body.dueDate ? parseOptionalDate(body.dueDate) || undefined : undefined,
      totalAmount: body.totalAmount === undefined ? undefined : parseNumber(body.totalAmount, 0),
      balanceDue: body.balanceDue === undefined ? undefined : parseNumber(body.balanceDue, 0),
      status: body.status && Object.values(InvoiceStatus).includes(body.status) ? body.status : undefined,
      notes: body.notes === null ? null : body.notes ? String(body.notes) : undefined,
    },
  });

  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await db.invoice.delete({ where: { id } });

  return ok({ deleted: true });
}
