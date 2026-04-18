import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { galleryMediaSchema } from '@/lib/validation';
import { logActivity, summarizeChanges } from '@/lib/audit';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = galleryMediaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid gallery media payload.' }, { status: 400 });
  }

  try {
    const before = await db.galleryMedia.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Gallery media not found.' }, { status: 404 });
    }

    const item = await db.galleryMedia.update({
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

    await logActivity({
      request,
      action: 'GALLERY_MEDIA_UPDATED',
      resource: 'gallery-media',
      resourceId: item.id,
      targetLabel: item.url,
      metadata: summarizeChanges(before as unknown as Record<string, unknown>, item as unknown as Record<string, unknown>, [
        'mediaEventId',
        'mediaType',
        'url',
        'thumbnailUrl',
        'caption',
        'sortOrder',
      ]),
    });

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update gallery media.' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const before = await db.galleryMedia.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Gallery media not found.' }, { status: 404 });
    }

    await db.galleryMedia.delete({ where: { id } });

    await logActivity({
      request,
      action: 'GALLERY_MEDIA_DELETED',
      resource: 'gallery-media',
      resourceId: before.id,
      targetLabel: before.url,
      metadata: {
        mediaEventId: before.mediaEventId,
        mediaType: before.mediaType,
        url: before.url,
        caption: before.caption,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete gallery media.' }, { status: 400 });
  }
}

