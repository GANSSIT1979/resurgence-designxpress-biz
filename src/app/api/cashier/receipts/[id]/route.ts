import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, ok, requireApiPermission } from '@/lib/api-utils';
import { receiptSchema } from '@/lib/validation';

type Params = { params: Promise<{ id: string }> };

function serializeReceipt(item: Awaited<ReturnType<typeof prisma.receipt.findFirstOrThrow>>) {
  return {
    ...item,
    issuedAt: item.issuedAt.toISOString(),
    notes: item.notes ?? null,
    invoiceId: item.invoiceId ?? null,
    transactionId: item.transactionId ?? null,
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireApiPermission(request, 'cashier.finance.manage');
  if (auth.error) return auth.error;

  const { id } = await params;
  const item = await prisma.receipt.findUnique({ where: { id } });
  if (!item) return fail('Receipt not found.', 404);

  return ok({ item: serializeReceipt(item) });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireApiPermission(request, 'cashier.finance.manage');
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = receiptSchema.safeParse(body);
  if (!parsed.success) return fail('Invalid receipt payload.', 400);

  const item = await prisma.receipt.update({
    where: { id },
    data: {
      receiptNumber: parsed.data.receiptNumber || undefined,
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

  return ok({ item: serializeReceipt(item) });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireApiPermission(request, 'cashier.finance.manage');
  if (auth.error) return auth.error;

  const { id } = await params;
  await prisma.receipt.delete({ where: { id } });
  return ok({ deleted: true });
}
