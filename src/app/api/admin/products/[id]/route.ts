import { NextResponse } from 'next/server';
import { db } from '@/lib/shop/db';
import { requireAdminUser } from '@/lib/shop/session';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser();
    const item = await db.shopProduct.findUnique({ where: { id: params.id } });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser();
    const body = await request.json();
    const item = await db.shopProduct.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        description: body.description,
        shortDescription: body.shortDescription,
        price: body.price,
        compareAtPrice: body.compareAtPrice,
        stock: body.stock,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        categoryId: body.categoryId,
        imageUrl: body.imageUrl
      }
    });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser();
    await db.shopProduct.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
