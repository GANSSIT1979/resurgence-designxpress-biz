import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { galleryMediaSchema } from '@/lib/validation';
import { logActivity } from '@/lib/audit';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = galleryMediaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid gallery media payload.' }, { status: 400 });
  }

  try {
    const item = await db.galleryMedia.create({
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
      action: 'GALLERY_MEDIA_CREATED',
      resource: 'gallery-media',
      resourceId: item.id,
      targetLabel: item.url,
      metadata: {
        mediaEventId: item.mediaEventId,
        mediaType: item.mediaType,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        caption: item.caption,
        sortOrder: item.sortOrder,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create gallery media.' }, { status: 400 });
  }
}

