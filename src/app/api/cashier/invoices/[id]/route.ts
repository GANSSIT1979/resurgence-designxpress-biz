import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoiceSchema } from "@/lib/validation";
import { logActivity, summarizeChanges } from "@/lib/audit";

function serializeInvoice(item: any) {
  return {
    ...item,
    createdAt: item.createdAt?.toISOString?.() ?? null,
    updatedAt: item.updatedAt?.toISOString?.() ?? null,
    issueDate: item.issueDate?.toISOString?.() ?? null,
    dueDate: item.dueDate?.toISOString?.() ?? null,
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

    const item = await db.invoice.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: serializeInvoice(item) });
  } catch (error) {
    console.error("GET /api/cashier/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Unable to load invoice." },
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
    const before = await db.invoice.findUnique({ where: { id } });

    if (!before) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid invoice payload." },
        { status: 400 }
      );
    }

    const amount = Number(parsed.data.amount || 0);
    const balanceAmount =
      parsed.data.balanceAmount === undefined || parsed.data.balanceAmount === null
        ? amount
        : Number(parsed.data.balanceAmount);

    const item = await db.invoice.update({
      where: { id },
      data: {
        invoiceNumber: parsed.data.invoiceNumber,
        sponsorId: parsed.data.sponsorId || null,
        companyName: parsed.data.companyName,
        contactName: parsed.data.contactName || null,
        email: parsed.data.email || null,
        tier: parsed.data.tier || null,
        description: parsed.data.description,
        amount,
        balanceAmount,
        status: parsed.data.status || "PENDING",
        issueDate: toDate(parsed.data.issueDate) || before.issueDate,
        dueDate: toDate(parsed.data.dueDate),
        notes: parsed.data.notes || null,
      },
    });

    await logActivity({
      request,
      action: "INVOICE_UPDATED",
      resource: "invoice",
      resourceId: item.id,
      targetLabel: item.invoiceNumber,
      metadata: summarizeChanges(
        before as unknown as Record<string, unknown>,
        item as unknown as Record<string, unknown>,
        [
          "invoiceNumber",
          "sponsorId",
          "companyName",
          "contactName",
          "email",
          "tier",
          "description",
          "amount",
          "balanceAmount",
          "status",
          "issueDate",
          "dueDate",
          "notes",
        ]
      ),
    });

    return NextResponse.json({ item: serializeInvoice(item) });
  } catch (error) {
    console.error("PUT /api/cashier/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Unable to update invoice." },
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
    const before = await db.invoice.findUnique({ where: { id } });

    if (!before) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    await db.invoice.delete({ where: { id } });

    await logActivity({
      request,
      action: "INVOICE_DELETED",
      resource: "invoice",
      resourceId: before.id,
      targetLabel: before.invoiceNumber,
      metadata: {
        invoiceNumber: before.invoiceNumber,
        sponsorId: before.sponsorId,
        companyName: before.companyName,
        amount: before.amount,
        balanceAmount: before.balanceAmount,
        status: before.status,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cashier/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Unable to delete invoice." },
      { status: 400 }
    );
  }
}