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
}
