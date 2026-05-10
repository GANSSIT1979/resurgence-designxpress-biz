import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok, requireApiPermission } from '@/lib/api-utils';
import { generateDocumentNumber } from '@/lib/cashier-server';
import { receiptSchema } from '@/lib/validation';

function serializeReceipt(item: Awaited<ReturnType<typeof prisma.receipt.findFirstOrThrow>>) {
  return {
    ...item,
    issuedAt: item.issuedAt.toISOString(),
    notes: item.notes ?? null,
    invoiceId: item.invoiceId ?? null,
    transactionId: item.transactionId ?? null,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireApiPermission(request, 'cashier.finance.manage');
  if (auth.error) return auth.error;

  const items = await prisma.receipt.findMany({ orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }] });
  return ok({ items: items.map(serializeReceipt) });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermission(request, 'cashier.finance.manage');
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = receiptSchema.safeParse(body);
  if (!parsed.success) return fail('Invalid receipt payload.', 400);

  const item = await prisma.receipt.create({
    data: {
      receiptNumber: parsed.data.receiptNumber || (await generateDocumentNumber('OR')),
      invoiceId: parsed.data.invoiceId || null,
      transactionId: parsed.data.transactionId || null,
      companyName: parsed.data.companyName,
      receivedFrom: parsed.data.receivedFrom,
      amount: parsed.data.amount,
      paymentMethod: parsed.data.paymentMethod,
      issuedAt: new Date(parsed.data.issuedAt),
      notes: parsed.data.notes || null,
    },
  });

  return ok({ item: serializeReceipt(item) }, 201);
}
