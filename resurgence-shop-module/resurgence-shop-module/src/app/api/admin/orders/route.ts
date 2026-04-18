import { NextResponse } from 'next/server';
import { db } from '@/lib/shop/db';
import { requireAdminUser } from '@/lib/shop/session';

export async function GET() {
  try {
    await requireAdminUser();
    const items = await db.shopOrder.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }
}
