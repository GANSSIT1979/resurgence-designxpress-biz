import { NextRequest } from "next/server";
import { InvoiceStatus, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok, parseNumber, parseOptionalDate, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await db.invoice.findMany({
    orderBy: { createdAt: "desc" },
  });

  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const customerName = String(body.customerName || "").trim();
  if (!customerName) return fail("Customer name is required.", 400);

  const item = await db.invoice.create({
    data: {
      number: body.number ? String(body.number) : null,
      sponsorId: body.sponsorId ? String(body.sponsorId) : null,
      customerName,
      issuedAt: parseOptionalDate(body.issuedAt) || new Date(),
      dueDate: parseOptionalDate(body.dueDate),
      totalAmount: parseNumber(body.totalAmount, 0),
      balanceDue: parseNumber(body.balanceDue, parseNumber(body.totalAmount, 0)),
      status: body.status && Object.values(InvoiceStatus).includes(body.status) ? body.status : InvoiceStatus.OPEN,
      notes: body.notes ? String(body.notes) : null,
    },
  });

  return ok({ item }, 201);
}
