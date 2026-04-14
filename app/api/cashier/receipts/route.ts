import { Decimal, Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { nextNumber } from "@/lib/counters";
import { ok, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await db.receipt.findMany({
    orderBy: { createdAt: "desc" }
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json();
  const number = await nextNumber("receipt", "RCT");

  const item = await db.receipt.create({
    data: {
      number,
      invoiceId: body.invoiceId,
      amount: new Decimal(Number(body.amount || 0)),
      issuedAt: body.issuedAt ? new Date(body.issuedAt) : new Date(),
      notes: body.notes || null
    }
  });

  return ok({ item });
}
