import { NextResponse } from 'next/server';
import { db } from '@/lib/shop/db';

export async function GET() {
  const items = await db.shopProduct.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
  });

  return NextResponse.json({ ok: true, items });
}
