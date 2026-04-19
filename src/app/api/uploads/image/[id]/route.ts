import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function contentDispositionFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  }

  return new Response(Buffer.from(asset.data), {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${contentDispositionFilename(asset.filename)}"`,
      'Content-Length': String(asset.size),
      'Content-Type': asset.contentType,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
