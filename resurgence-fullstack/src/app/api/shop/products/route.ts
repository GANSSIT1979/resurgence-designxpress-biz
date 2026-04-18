import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const items = await prisma.shopProduct.findMany({ where: { isActive: true }, include: { category: true }, orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ items });
}
