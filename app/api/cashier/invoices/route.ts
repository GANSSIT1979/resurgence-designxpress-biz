import { Decimal, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { nextNumber } from "@/lib/counters";
import { ok, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await db.invoice.findMany({
    orderBy: { createdAt: "desc" }
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const number = await nextNumber("invoice", "INV");
  const totalAmount = Number(body.totalAmount || 0);

  const item = await db.invoice.create({
    data: {
      number,
      sponsorId: body.sponsorId || null,
      customerName: body.customerName,
      issuedAt: body.issuedAt ? new Date(body.issuedAt) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      totalAmount: new Decimal(totalAmount),
      balanceDue: new Decimal(totalAmount),
      notes: body.notes || null
    }
  });

  return ok({ item });
}
