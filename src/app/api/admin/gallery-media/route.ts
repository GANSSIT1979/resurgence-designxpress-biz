import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { galleryMediaSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = galleryMediaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid gallery media payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.galleryMedia.create({
      data: {
        mediaEventId: parsed.data.mediaEventId,
        mediaType: parsed.data.mediaType,
        url: parsed.data.url,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        caption: parsed.data.caption || null,
        sortOrder: parsed.data.sortOrder,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create gallery media.' }, { status: 400 });
  }
}
