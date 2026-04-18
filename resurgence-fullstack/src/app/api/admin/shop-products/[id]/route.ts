import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { shopProductSchema } from '@/lib/validation';
import { slugify } from '@/lib/shop';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const normalized = body ? { ...body, slug: body.slug || slugify(body.name || '') } : null;
  const parsed = shopProductSchema.safeParse(normalized);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid shop product payload.' }, { status: 400 });
  try {
    const item = await prisma.shopProduct.update({ where: { id }, data: { ...parsed.data, compareAtPrice: parsed.data.compareAtPrice || null, sku: parsed.data.sku || null, shortDescription: parsed.data.shortDescription || null, imageUrl: parsed.data.imageUrl || null, categoryId: parsed.data.categoryId || null }, include: { category: true } });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update product.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.shopProduct.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 400 });
  }
}
