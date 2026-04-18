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

export async function GET() {
  const items = await prisma.shopProduct.findMany({ include: { category: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const normalized = body ? { ...body, slug: body.slug || slugify(body.name || '') } : null;
  const parsed = shopProductSchema.safeParse(normalized);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid shop product payload.' }, { status: 400 });
  try {
    const item = await prisma.shopProduct.create({ data: productPayload(parsed.data), include: { category: true } });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create product. Make sure slug and SKU are unique.' }, { status: 400 });
  }
}
