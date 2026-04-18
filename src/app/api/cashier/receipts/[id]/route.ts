import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { receiptSchema } from '@/lib/validation';
import { buildReceiptPayload, serializeReceipt } from '@/lib/cashier-api';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsed = receiptSchema.parse(await request.json());
    const payload = await buildReceiptPayload(parsed);
    const item = await prisma.receipt.update({ where: { id }, data: payload });
    return NextResponse.json({ item: serializeReceipt(item) });
  } catch {
    return NextResponse.json({ error: 'Unable to update receipt.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.receipt.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete receipt.' }, { status: 400 });
  }
}
