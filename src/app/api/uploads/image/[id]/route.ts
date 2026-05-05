import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

function safeContentDispositionFilename(filename: string | null | undefined) {
  const safe = (filename || 'image')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 180);

  return safe || 'image';
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing image id.' },
        { status: 400 }
      );
    }

    const asset = await prisma.uploadAsset.findUnique({
      where: { id },
      select: {
        filename: true,
        contentType: true,
        size: true,
        data: true,
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Image not found.' },
        { status: 404 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(asset.contentType)) {
      return NextResponse.json(
        { error: 'Unsupported image type.' },
        { status: 415 }
      );
    }

    const body = Buffer.isBuffer(asset.data)
      ? asset.data
      : Buffer.from(asset.data);

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': asset.contentType,
        'Content-Length': String(asset.size || body.length),
        'Content-Disposition': `inline; filename="${safeContentDispositionFilename(
          asset.filename
        )}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[UPLOAD_IMAGE_GET]', error);

    return NextResponse.json(
      { error: 'Failed to load image.' },
      { status: 500 }
    );
  }
}