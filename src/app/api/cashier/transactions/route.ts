import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/cashier';
import { cashierTransactionSchema } from '@/lib/validation';
import { buildTransactionPayload, serializeTransaction, syncLinkedInvoice } from '@/lib/cashier-api';
import { createWorkflowAutomation } from '@/lib/notifications';
import { requireApiPermission } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const auth = await requireApiPermission(request, 'cashier.finance.manage');
  if (auth.error) return auth.error;

  const items = await prisma.cashierTransaction.findMany({ orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ items: items.map(serializeTransaction) });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermission(request, 'cashier.finance.manage');
  if (auth.error) return auth.error;

  try {
    const parsed = cashierTransactionSchema.parse(await request.json());
    const payload = await buildTransactionPayload(parsed);
    const item = await prisma.cashierTransaction.create({ data: payload });
    await syncLinkedInvoice(item.invoiceId);
    const invoice = item.invoiceId ? await prisma.invoice.findUnique({ where: { id: item.invoiceId } }) : null;
    const actionLabel =
      item.kind === 'REFUND' ? 'Refund processed' : item.kind === 'ADJUSTMENT' ? 'Adjustment recorded' : 'Collection recorded';

    await createWorkflowAutomation({
      notifications: [
        {
          recipientRole: 'CASHIER',
          title: `${actionLabel}: ${item.transactionNumber}`,
          message: `${item.companyName} ${item.kind.toLowerCase()} amount is ${formatCurrency(item.amount)}.`,
          level: item.kind === 'COLLECTION' ? 'SUCCESS' : item.kind === 'REFUND' ? 'WARNING' : 'INFO',
          href: '/cashier/transactions',
          metadata: { transactionId: item.id, invoiceId: item.invoiceId },
        },
        {
          recipientRole: 'SYSTEM_ADMIN',
          title: `Finance activity posted`,
          message: `${item.transactionNumber} updated the sponsor finance ledger.`,
          level: 'INFO',
          href: '/admin/reports',
          metadata: { transactionId: item.id, invoiceId: item.invoiceId },
        },
      ],
      emails:
        invoice?.email && item.kind !== 'ADJUSTMENT'
          ? [
              {
                recipientRole: 'SPONSOR',
                toEmail: invoice.email,
                toName: invoice.contactName || invoice.companyName,
                subject: `${actionLabel} for ${invoice.invoiceNumber}`,
                bodyText: `Hi ${invoice.contactName || invoice.companyName},\n\nA ${item.kind.toLowerCase()} entry worth ${formatCurrency(item.amount)} was posted against invoice ${invoice.invoiceNumber}.`,
                eventKey: 'transaction.created.contact',
                relatedType: 'CashierTransaction',
                relatedId: item.id,
              },
            ]
          : [],
    });
    return NextResponse.json({ item: serializeTransaction(item) });
  } catch {
    return NextResponse.json({ error: 'Unable to record transaction.' }, { status: 400 });
  }
}
