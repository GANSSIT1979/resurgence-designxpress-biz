import { NextResponse } from 'next/server';
import { db } from '@/lib/shop/db';
import { requireAdminUser } from '@/lib/shop/session';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser();
    const item = await db.shopOrder.findUnique({
      where: { id: params.id },
      include: { items: true }
    });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser();
    const body = await request.json();
    const item = await db.shopOrder.update({
      where: { id: params.id },
      data: {
        orderStatus: body.orderStatus,
        paymentStatus: body.paymentStatus,
        paymentProofUrl: body.paymentProofUrl
      }
    });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
