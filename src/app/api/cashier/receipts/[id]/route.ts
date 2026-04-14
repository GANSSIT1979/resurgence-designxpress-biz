import { Decimal, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const item = await db.receipt.update({
    where: { id },
    data: {
      invoiceId: body.invoiceId,
      amount: new Decimal(Number(body.amount || 0)),
      issuedAt: body.issuedAt ? new Date(body.issuedAt) : undefined,
      notes: body.notes || null
    }
  });

  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await db.receipt.delete({ where: { id } });
  return ok({ success: true });
}
