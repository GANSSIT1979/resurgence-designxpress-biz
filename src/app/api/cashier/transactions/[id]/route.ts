import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cashierTransactionSchema } from '@/lib/validation';
import { buildTransactionPayload, serializeTransaction, syncLinkedInvoice } from '@/lib/cashier-api';
import { requireApiPermission } from '@/lib/api-utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission(request, 'cashier.finance.manage');
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const existing = await prisma.cashierTransaction.findUnique({ where: { id } });
    const parsed = cashierTransactionSchema.parse(await request.json());
    const payload = await buildTransactionPayload(parsed);
    const item = await prisma.cashierTransaction.update({ where: { id }, data: payload });
    await syncLinkedInvoice(existing?.invoiceId);
    await syncLinkedInvoice(item.invoiceId);
    return NextResponse.json({ item: serializeTransaction(item) });
  } catch {
    return NextResponse.json({ error: 'Unable to update transaction.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission(request, 'cashier.finance.manage');
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const existing = await prisma.cashierTransaction.findUnique({ where: { id } });
    await prisma.cashierTransaction.delete({ where: { id } });
    await syncLinkedInvoice(existing?.invoiceId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete transaction.' }, { status: 400 });
  }
}
