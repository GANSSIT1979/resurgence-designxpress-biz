import { NextResponse } from 'next/server';
import { removeCartItem, updateCartItem } from '@/lib/shop/cart';
import { requireCurrentUser } from '@/lib/shop/session';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireCurrentUser();
    const body = await request.json();
    const item = await updateCartItem(params.id, Number(body.quantity || 1));
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireCurrentUser();
    await removeCartItem(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
