import { NextResponse } from 'next/server';
import { db } from '@/lib/shop/db';
import { requireAdminUser } from '@/lib/shop/session';

export async function GET() {
  try {
    await requireAdminUser();
    const items = await db.shopProduct.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const body = await request.json();
    const item = await db.shopProduct.create({
      data: {
        name: String(body.name),
        slug: String(body.slug),
        sku: body.sku ? String(body.sku) : null,
        description: body.description ? String(body.description) : null,
        shortDescription: body.shortDescription ? String(body.shortDescription) : null,
        price: Number(body.price || 0),
        compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null,
        stock: Number(body.stock || 0),
        isActive: body.isActive !== false,
        isFeatured: body.isFeatured === true,
        categoryId: body.categoryId ? String(body.categoryId) : null,
        imageUrl: body.imageUrl ? String(body.imageUrl) : null
      }
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create failed';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
