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
}
