import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { receiptSchema } from "@/lib/validation";
import { logActivity, summarizeChanges } from "@/lib/audit";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await db.receipt.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Receipt not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: serializeReceipt(item) });
  } catch (error) {
    console.error("GET /api/cashier/receipts/[id] error:", error);
    return NextResponse.json(
      { error: "Unable to load receipt." },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const before = await db.receipt.findUnique({ where: { id } });

    if (!before) {
      return NextResponse.json(
        { error: "Receipt not found." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = receiptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid receipt payload." },
        { status: 400 }
      );
    }

    const amount = Number(parsed.data.amount || 0);

    const item = await db.receipt.update({
      where: { id },
      data: {
        receiptNumber: parsed.data.receiptNumber,
        invoiceId: parsed.data.invoiceId || null,
        transactionId: parsed.data.transactionId || null,
        companyName: parsed.data.companyName,
        receivedFrom: parsed.data.receivedFrom,
        amount,
        paymentMethod: parsed.data.paymentMethod,
        issuedAt: toDate(parsed.data.issuedAt) || before.issuedAt,
        notes: parsed.data.notes || null,
      },
    });

    await logActivity({
      request,
      action: "RECEIPT_UPDATED",
      resource: "receipt",
      resourceId: item.id,
      targetLabel: item.receiptNumber,
      metadata: summarizeChanges(
        before as unknown as Record<string, unknown>,
        item as unknown as Record<string, unknown>,
        [
          "receiptNumber",
          "invoiceId",
          "transactionId",
          "companyName",
          "receivedFrom",
          "amount",
          "paymentMethod",
          "issuedAt",
          "notes",
        ]
      ),
    });

    return NextResponse.json({ item: serializeReceipt(item) });
  } catch (error) {
    console.error("PUT /api/cashier/receipts/[id] error:", error);
    return NextResponse.json(
      { error: "Unable to update receipt." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const before = await db.receipt.findUnique({ where: { id } });

    if (!before) {
      return NextResponse.json(
        { error: "Receipt not found." },
        { status: 404 }
      );
    }

    await db.receipt.delete({ where: { id } });

    await logActivity({
      request,
      action: "RECEIPT_DELETED",
      resource: "receipt",
      resourceId: before.id,
      targetLabel: before.receiptNumber,
      metadata: {
        receiptNumber: before.receiptNumber,
        invoiceId: before.invoiceId,
        transactionId: before.transactionId,
        companyName: before.companyName,
        receivedFrom: before.receivedFrom,
        amount: before.amount,
        paymentMethod: before.paymentMethod,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cashier/receipts/[id] error:", error);
    return NextResponse.json(
      { error: "Unable to delete receipt." },
      { status: 400 }
    );
  }
}