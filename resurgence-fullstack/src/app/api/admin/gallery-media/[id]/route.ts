import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { galleryMediaSchema } from '@/lib/validation';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = galleryMediaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid gallery media payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.galleryMedia.update({
      where: { id },
      data: {
        mediaEventId: parsed.data.mediaEventId,
        mediaType: parsed.data.mediaType,
        url: parsed.data.url,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        caption: parsed.data.caption || null,
        sortOrder: parsed.data.sortOrder,
      },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update gallery media.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.galleryMedia.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete gallery media.' }, { status: 400 });
  }
}
