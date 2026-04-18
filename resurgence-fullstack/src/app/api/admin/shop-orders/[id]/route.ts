import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { shopOrderUpdateSchema } from '@/lib/validation';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = shopOrderUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid order update payload.' }, { status: 400 });
  try {
    const item = await prisma.shopOrder.update({ where: { id }, data: parsed.data, include: { items: true } });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 400 });
  }
}
