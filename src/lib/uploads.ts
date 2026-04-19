import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { prisma } from '@/lib/prisma';

export const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const maxUploadSizeBytes = 5 * 1024 * 1024;

export type UploadScope = 'sponsor' | 'creator' | 'brand-profile' | 'merch';
type UploadStorageMode = 'database' | 'filesystem';

const scopeFolders: Record<UploadScope, string> = {
  sponsor: 'sponsors',
  creator: 'creators',
  'brand-profile': 'brand-profiles',
  merch: 'merch',
};

function getUploadStorageMode(): UploadStorageMode {
  const configured = process.env.UPLOAD_STORAGE?.trim().toLowerCase();
  if (configured === 'database' || configured === 'filesystem') return configured;

  return process.env.VERCEL ? 'database' : 'filesystem';
}

function sanitizeFilename(filename: string) {
  const baseName = filename.replace(/\.[^.]+$/, '');
  return baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'asset';
}

function inferExtension(filename: string, mimeType: string) {
  const existing = extname(filename).toLowerCase();
  if (existing) return existing;

  switch (mimeType) {
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '.jpg';
  }
}

export async function saveImageUpload(
  file: File,
  scope: UploadScope,
  uploader?: { userId?: string; userEmail?: string },
) {
  if (!allowedImageMimeTypes.includes(file.type as (typeof allowedImageMimeTypes)[number])) {
    throw new Error('Only JPG, PNG, WEBP, and GIF uploads are supported.');
  }

  if (file.size > maxUploadSizeBytes) {
    throw new Error('Image upload must be 5MB or smaller.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = inferExtension(file.name, file.type);
  const filename = `${sanitizeFilename(file.name)}-${randomUUID()}${extension}`;

  if (getUploadStorageMode() === 'database') {
    const asset = await prisma.uploadAsset.create({
      data: {
        scope,
        filename,
        contentType: file.type,
        size: file.size,
        data: buffer,
        uploadedById: uploader?.userId || null,
        uploadedByEmail: uploader?.userEmail || null,
      },
      select: { id: true },
    });

    return `/api/uploads/image/${asset.id}`;
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uploadDir = join(process.cwd(), 'public', 'uploads', scopeFolders[scope], year, month);
  await mkdir(uploadDir, { recursive: true });

  const filePath = join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return `/uploads/${scopeFolders[scope]}/${year}/${month}/${filename}`;
}
