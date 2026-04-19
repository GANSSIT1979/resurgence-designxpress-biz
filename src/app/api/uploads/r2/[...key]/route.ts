import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getR2Client() {
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  return new S3Client({
    region: process.env.R2_REGION || 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
}

function safeFilename(key: string) {
  return (key.split('/').pop() || 'asset').replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: keyParts } = await params;
  const key = keyParts.join('/');

  if (!key || keyParts.some((part) => !part || part === '..')) {
    return NextResponse.json({ error: 'Invalid image key.' }, { status: 400 });
  }

  try {
    const object = await getR2Client().send(
      new GetObjectCommand({
        Bucket: getRequiredEnv('R2_BUCKET'),
        Key: key,
      }),
    );

    const bytes = await object.Body?.transformToByteArray();
    if (!bytes) {
      return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
    }

    const buffer = Buffer.from(bytes);

    return new Response(buffer, {
      headers: {
        'Cache-Control': object.CacheControl || 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${safeFilename(key)}"`,
        'Content-Length': object.ContentLength ? String(object.ContentLength) : String(buffer.byteLength),
        'Content-Type': object.ContentType || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  }
}
