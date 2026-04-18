import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.shopProduct.findUnique({ where: { slug }, include: { category: true } });
  if (!item || !item.isActive) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  return NextResponse.json({ item });
}
