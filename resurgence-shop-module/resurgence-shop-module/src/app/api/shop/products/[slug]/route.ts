import { NextResponse } from 'next/server';
import { db } from '@/lib/shop/db';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const item = await db.shopProduct.findUnique({
    where: { slug: params.slug },
    include: { category: true }
  });

  if (!item) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}
