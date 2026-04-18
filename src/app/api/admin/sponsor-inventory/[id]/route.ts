import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sponsorInventoryCategorySchema } from '@/lib/validation';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = sponsorInventoryCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.sponsorInventoryCategory.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update inventory category.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.sponsorInventoryCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete inventory category.' }, { status: 400 });
  }
}
