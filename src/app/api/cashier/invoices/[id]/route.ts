import { Decimal, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";
import { recalculateInvoice } from "@/lib/invoice";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const item = await db.invoice.update({
    where: { id },
    data: {
      sponsorId: body.sponsorId || null,
      customerName: body.customerName,
      issuedAt: body.issuedAt ? new Date(body.issuedAt) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      totalAmount: body.totalAmount ? new Decimal(Number(body.totalAmount)) : undefined,
      notes: body.notes || null
    }
  });

  await recalculateInvoice(id);
  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await db.invoice.delete({ where: { id } });
  return ok({ success: true });
}
