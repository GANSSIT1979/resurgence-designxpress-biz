import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoiceSchema } from "@/lib/validation";
import { logActivity } from "@/lib/audit";

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

export async function GET() {
  try {
    const items = await db.invoice.findMany({
      orderBy: [{ issueDate: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ items: items.map(serializeInvoice) });
  } catch (error) {
    console.error("GET /api/cashier/invoices error:", error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
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

    const item = await db.invoice.create({
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
        issueDate: toDate(parsed.data.issueDate) || new Date(),
        dueDate: toDate(parsed.data.dueDate),
        notes: parsed.data.notes || null,
      },
    });

    await logActivity({
      request,
      action: "INVOICE_CREATED",
      resource: "invoice",
      resourceId: item.id,
      targetLabel: item.invoiceNumber,
      metadata: {
        invoiceNumber: item.invoiceNumber,
        sponsorId: item.sponsorId,
        companyName: item.companyName,
        amount: item.amount,
        balanceAmount: item.balanceAmount,
        status: item.status,
      },
    });

    return NextResponse.json({ item: serializeInvoice(item) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cashier/invoices error:", error);
    return NextResponse.json(
      { error: "Unable to create invoice." },
      { status: 400 }
    );
  }
}