<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/cashier';
import { receiptSchema } from '@/lib/validation';
import { buildReceiptPayload, serializeReceipt } from '@/lib/cashier-api';
import { createWorkflowAutomation } from '@/lib/notifications';

export async function GET() {
  const items = await prisma.receipt.findMany({ orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ items: items.map(serializeReceipt) });
}

export async function POST(request: Request) {
  try {
    const parsed = receiptSchema.parse(await request.json());
    const payload = await buildReceiptPayload(parsed);
    const item = await prisma.receipt.create({ data: payload });
    const invoice = item.invoiceId ? await prisma.invoice.findUnique({ where: { id: item.invoiceId } }) : null;

    await createWorkflowAutomation({
      notifications: [
        {
          recipientRole: 'CASHIER',
          title: `Receipt ${item.receiptNumber} issued`,
          message: `${item.companyName} receipt was issued for ${formatCurrency(item.amount)}.`,
          level: 'SUCCESS',
          href: '/cashier/receipts',
          metadata: { receiptId: item.id, invoiceId: item.invoiceId },
        },
        {
          recipientRole: 'SYSTEM_ADMIN',
          title: 'Sponsor receipt generated',
          message: `${item.receiptNumber} is ready for sponsor finance records.`,
          level: 'INFO',
          href: '/admin/reports',
          metadata: { receiptId: item.id, invoiceId: item.invoiceId },
        },
      ],
      emails: invoice?.email
        ? [
            {
              recipientRole: 'SPONSOR',
              toEmail: invoice.email,
              toName: invoice.contactName || item.receivedFrom,
              subject: `Receipt ${item.receiptNumber} from RESURGENCE`,
              bodyText: `Hi ${invoice.contactName || item.receivedFrom},\n\nReceipt ${item.receiptNumber} has been generated for ${formatCurrency(item.amount)}.`,
              eventKey: 'receipt.created.contact',
              relatedType: 'Receipt',
              relatedId: item.id,
            },
          ]
        : [],
    });
    return NextResponse.json({ item: serializeReceipt(item) });
  } catch {
    return NextResponse.json({ error: 'Unable to create receipt.' }, { status: 400 });
  }
=======
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
>>>>>>> parent of d975526 (commit)
}
