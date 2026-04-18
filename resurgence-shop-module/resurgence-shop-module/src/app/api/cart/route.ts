import { NextResponse } from 'next/server';
import { addToCart, getCart } from '@/lib/shop/cart';
import { requireCurrentUser } from '@/lib/shop/session';

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const cart = await getCart(user.id);
    return NextResponse.json({ ok: true, ...cart });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const formData = await request.formData().catch(() => null);

    const body = formData
      ? {
          productId: String(formData.get('productId') || ''),
          quantity: Number(formData.get('quantity') || 1)
        }
      : await request.json();

    if (!body.productId) {
      return NextResponse.json({ ok: false, error: 'productId is required' }, { status: 400 });
    }

    await addToCart(user.id, body.productId, Number(body.quantity || 1));

    if (formData) {
      return NextResponse.redirect(new URL('/cart', request.url));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
