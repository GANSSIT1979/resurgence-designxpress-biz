import { Decimal, Role, TransactionType } from "@prisma/client";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { recalculateInvoice } from "@/lib/invoice";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await db.cashierTransaction.findMany({
    orderBy: { createdAt: "desc" }
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json();

  const item = await db.cashierTransaction.create({
    data: {
      invoiceId: body.invoiceId,
      type: body.type as TransactionType,
      amount: new Decimal(Number(body.amount || 0)),
      reference: body.reference || null,
      notes: body.notes || null
    }
  });

  await recalculateInvoice(body.invoiceId);
  return ok({ item });
}
