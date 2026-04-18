<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { receiptSchema } from '@/lib/validation';
import { buildReceiptPayload, serializeReceipt } from '@/lib/cashier-api';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsed = receiptSchema.parse(await request.json());
    const payload = await buildReceiptPayload(parsed);
    const item = await prisma.receipt.update({ where: { id }, data: payload });
    return NextResponse.json({ item: serializeReceipt(item) });
  } catch {
    return NextResponse.json({ error: 'Unable to update receipt.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.receipt.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete receipt.' }, { status: 400 });
  }
}
=======
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, parseNumber, parseOptionalDate, requireApiRole } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const item = await db.receipt.findUnique({ where: { id } });
  if (!item) return fail("Receipt not found.", 404);

  return ok({ item });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const item = await db.receipt.update({
    where: { id },
    data: {
      number: body.number === null ? null : body.number ? String(body.number) : undefined,
      invoiceId: body.invoiceId ? String(body.invoiceId) : undefined,
      amount: body.amount === undefined ? undefined : parseNumber(body.amount, 0),
      issuedAt: body.issuedAt === null ? null : body.issuedAt ? parseOptionalDate(body.issuedAt) || undefined : undefined,
      notes: body.notes === null ? null : body.notes ? String(body.notes) : undefined,
    },
  });

  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await db.receipt.delete({ where: { id } });

  return ok({ deleted: true });
}
>>>>>>> parent of d975526 (commit)
