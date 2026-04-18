<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/cashier';
import { invoiceSchema } from '@/lib/validation';
import { buildInvoicePayload, serializeInvoice } from '@/lib/cashier-api';
import { createWorkflowAutomation } from '@/lib/notifications';

export async function GET() {
  const items = await prisma.invoice.findMany({ orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ items: items.map(serializeInvoice) });
}

export async function POST(request: Request) {
  try {
    const parsed = invoiceSchema.parse(await request.json());
    const payload = await buildInvoicePayload(parsed);
    const item = await prisma.invoice.create({ data: payload });
    await createWorkflowAutomation({
      notifications: [
        {
          recipientRole: 'CASHIER',
          title: `Invoice ${item.invoiceNumber} issued`,
          message: `${item.companyName} was invoiced for ${formatCurrency(item.amount)}.`,
          level: 'SUCCESS',
          href: '/cashier/invoices',
          metadata: { invoiceId: item.id },
        },
        {
          recipientRole: 'SYSTEM_ADMIN',
          title: 'New sponsorship invoice created',
          message: `${item.invoiceNumber} was added for ${item.companyName}.`,
          level: 'INFO',
          href: '/admin/reports',
          metadata: { invoiceId: item.id },
        },
      ],
      emails: item.email
        ? [
            {
              recipientRole: 'SPONSOR',
              toEmail: item.email,
              toName: item.contactName || item.companyName,
              subject: `Invoice ${item.invoiceNumber} from RESURGENCE`,
              bodyText: `Hi ${item.contactName || item.companyName},\n\nInvoice ${item.invoiceNumber} has been issued for ${formatCurrency(item.amount)}.\n\nDescription:\n${item.description}\n\nThank you for partnering with RESURGENCE Powered by DesignXpress.`,
              eventKey: 'invoice.created.contact',
              relatedType: 'Invoice',
              relatedId: item.id,
            },
          ]
        : [],
    });
    return NextResponse.json({ item: serializeInvoice(item) });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create invoice.' }, { status: 400 });
  }
=======
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
>>>>>>> parent of d975526 (commit)
}
