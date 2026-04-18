import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';

export const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const maxUploadSizeBytes = 5 * 1024 * 1024;

export type UploadScope = 'sponsor' | 'creator' | 'brand-profile' | 'merch';

const scopeFolders: Record<UploadScope, string> = {
  sponsor: 'sponsors',
  creator: 'creators',
  'brand-profile': 'brand-profiles',
  merch: 'merch',
};

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

export async function saveImageUpload(file: File, scope: UploadScope) {
  if (!allowedImageMimeTypes.includes(file.type as (typeof allowedImageMimeTypes)[number])) {
    throw new Error('Only JPG, PNG, WEBP, and GIF uploads are supported.');
  }

  if (file.size > maxUploadSizeBytes) {
    throw new Error('Image upload must be 5MB or smaller.');
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uploadDir = join(process.cwd(), 'public', 'uploads', scopeFolders[scope], year, month);
  await mkdir(uploadDir, { recursive: true });

  const extension = inferExtension(file.name, file.type);
  const filename = `${sanitizeFilename(file.name)}-${randomUUID()}${extension}`;
  const filePath = join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/${scopeFolders[scope]}/${year}/${month}/${filename}`;
}
