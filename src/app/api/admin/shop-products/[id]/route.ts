import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { shopProductSchema } from '@/lib/validation';
import { slugify } from '@/lib/shop';

function productPayload(data: any) {
  return {
    ...data,
    compareAtPrice: data.compareAtPrice || null,
    sku: data.sku || null,
    shortDescription: data.shortDescription || null,
    imageUrl: data.imageUrl || null,
    badgeLabel: data.badgeLabel || null,
    material: data.material || null,
    fitNotes: data.fitNotes || null,
    careInstructions: data.careInstructions || null,
    availableSizes: data.availableSizes || null,
    availableColors: data.availableColors || null,
    categoryId: data.categoryId || null,
  };
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const normalized = body ? { ...body, slug: body.slug || slugify(body.name || '') } : null;
  const parsed = shopProductSchema.safeParse(normalized);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid shop product payload.' }, { status: 400 });
  try {
    const item = await prisma.shopProduct.update({ where: { id }, data: productPayload(parsed.data), include: { category: true } });
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
