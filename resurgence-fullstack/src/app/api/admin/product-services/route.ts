import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productServiceSchema } from '@/lib/validation';

export async function GET() {
  const items = await prisma.productService.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = productServiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid product/service payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.productService.create({ data: parsed.data });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create product/service.' }, { status: 400 });
  }
}
