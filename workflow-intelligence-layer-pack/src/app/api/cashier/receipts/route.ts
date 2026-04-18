import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, parseNumber, parseOptionalDate, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await db.receipt.findMany({
    orderBy: { createdAt: "desc" },
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const invoiceId = String(body.invoiceId || "").trim();
  if (!invoiceId) return fail("Invoice ID is required.", 400);

  const item = await db.receipt.create({
    data: {
      number: body.number ? String(body.number) : null,
      invoiceId,
      amount: parseNumber(body.amount, 0),
      issuedAt: parseOptionalDate(body.issuedAt) || new Date(),
      notes: body.notes ? String(body.notes) : null,
    },
  });

  return ok({ item }, 201);
}
