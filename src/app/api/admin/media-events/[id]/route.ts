import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mediaEventSchema } from '@/lib/validation';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = mediaEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid gallery event payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.mediaEvent.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
        creatorId: parsed.data.creatorId || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update gallery event.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.mediaEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete gallery event.' }, { status: 400 });
  }
}
