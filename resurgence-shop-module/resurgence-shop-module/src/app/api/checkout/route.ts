import { NextResponse } from 'next/server';
import { createOrderFromCart } from '@/lib/shop/checkout';
import { requireCurrentUser } from '@/lib/shop/session';

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const formData = await request.formData().catch(() => null);
    const body = formData
      ? Object.fromEntries(formData.entries())
      : await request.json();

    const order = await createOrderFromCart(user.id, {
      customerName: String(body.customerName || ''),
      customerEmail: String(body.customerEmail || ''),
      customerPhone: String(body.customerPhone || ''),
      addressLine1: String(body.addressLine1 || ''),
      city: String(body.city || ''),
      province: String(body.province || ''),
      postalCode: String(body.postalCode || ''),
      paymentMethod: String(body.paymentMethod || 'COD') as 'COD' | 'GCASH_MANUAL' | 'BANK_TRANSFER',
      notes: String(body.notes || '')
    });

    if (formData) {
      return NextResponse.redirect(new URL('/account/orders', request.url));
    }

    return NextResponse.json({ ok: true, item: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
