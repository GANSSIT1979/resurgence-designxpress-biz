import { Decimal, Role, TransactionType } from "@prisma/client";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { recalculateInvoice } from "@/lib/invoice";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const existing = await db.cashierTransaction.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Transaction not found" }, { status: 404 });

  const body = await request.json();

  const item = await db.cashierTransaction.update({
    where: { id },
    data: {
      invoiceId: body.invoiceId,
      type: body.type as TransactionType,
      amount: new Decimal(Number(body.amount || 0)),
      reference: body.reference || null,
      notes: body.notes || null
    }
  });

  if (body.invoiceId && body.invoiceId !== existing.invoiceId) {
    await recalculateInvoice(existing.invoiceId);
    await recalculateInvoice(body.invoiceId);
  } else {
    await recalculateInvoice(existing.invoiceId);
  }
  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const existing = await db.cashierTransaction.findUnique({ where: { id } });
  await db.cashierTransaction.delete({ where: { id } });
  if (existing) await recalculateInvoice(existing.invoiceId);
  return ok({ success: true });
}
