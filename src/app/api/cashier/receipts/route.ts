import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { receiptSchema } from "@/lib/validation";
import { logActivity } from "@/lib/audit";

function serializeReceipt(item: any) {
  return {
    ...item,
    createdAt: item.createdAt?.toISOString?.() ?? null,
    updatedAt: item.updatedAt?.toISOString?.() ?? null,
    issuedAt: item.issuedAt?.toISOString?.() ?? null,
  };
}

function toDate(value: unknown) {
  if (!value || typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET() {
  try {
    const items = await db.receipt.findMany({
      orderBy: [{ issuedAt: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ items: items.map(serializeReceipt) });
  } catch (error) {
    console.error("GET /api/cashier/receipts error:", error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = receiptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid receipt payload." },
        { status: 400 }
      );
    }

    const amount = Number(parsed.data.amount || 0);

    const item = await db.receipt.create({
      data: {
        receiptNumber: parsed.data.receiptNumber,
        invoiceId: parsed.data.invoiceId || null,
        transactionId: parsed.data.transactionId || null,
        companyName: parsed.data.companyName,
        receivedFrom: parsed.data.receivedFrom,
        amount,
        paymentMethod: parsed.data.paymentMethod,
        issuedAt: toDate(parsed.data.issuedAt) || new Date(),
        notes: parsed.data.notes || null,
      },
    });

    await logActivity({
      request,
      action: "RECEIPT_CREATED",
      resource: "receipt",
      resourceId: item.id,
      targetLabel: item.receiptNumber,
      metadata: {
        receiptNumber: item.receiptNumber,
        invoiceId: item.invoiceId,
        transactionId: item.transactionId,
        companyName: item.companyName,
        receivedFrom: item.receivedFrom,
        amount: item.amount,
        paymentMethod: item.paymentMethod,
      },
    });

    return NextResponse.json({ item: serializeReceipt(item) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cashier/receipts error:", error);
    return NextResponse.json(
      { error: "Unable to create receipt." },
      { status: 400 }
    );
  }
}