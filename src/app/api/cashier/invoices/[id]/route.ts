import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invoiceSchema } from '@/lib/validation';
import { buildInvoicePayload, serializeInvoice } from '@/lib/cashier-api';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsed = invoiceSchema.parse(await request.json());
    const payload = await buildInvoicePayload(parsed);
    const item = await prisma.invoice.update({ where: { id }, data: payload });
    return NextResponse.json({ item: serializeInvoice(item) });
  } catch {
    return NextResponse.json({ error: 'Unable to update invoice.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete invoice.' }, { status: 400 });
  }
}
