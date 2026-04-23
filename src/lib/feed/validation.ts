import { z } from 'zod';

const optionalText = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z.string().optional().default(''),
);

const urlValue = z.preprocess((value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}, z.union([z.string().url(), z.literal('')]).default(''));

export const feedMediaAssetInputSchema = z.object({
  mediaType: z.enum(['IMAGE', 'VIDEO', 'YOUTUBE', 'VIMEO', 'EXTERNAL']).default('IMAGE'),
  url: urlValue,
  thumbnailUrl: urlValue,
  storageProvider: optionalText,
  storageKey: optionalText,
  contentType: optionalText,
  size: z.coerce.number().int().min(0).optional(),
  durationSeconds: z.coerce.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  altText: optionalText,
  caption: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const feedPostInputSchema = z.object({
  caption: z.string().trim().min(2).max(2200),
  summary: optionalText,
  visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE']).default('PUBLIC'),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'HIDDEN', 'ARCHIVED']).optional(),
  creatorProfileId: optionalText,
  isFeatured: z.coerce.boolean().default(false),
  isPinned: z.coerce.boolean().default(false),
  mediaAssets: z.array(feedMediaAssetInputSchema).min(1).max(10),
  hashtags: z.array(z.string().trim().min(1).max(50)).max(12).default([]),
  productIds: z.array(z.string().trim().min(1)).max(8).default([]),
});

export const feedPostPatchSchema = feedPostInputSchema.partial();

export const feedCommentInputSchema = z.object({
  body: z.string().trim().min(1).max(800),
  parentCommentId: optionalText,
});

export const feedProductTagInputSchema = z.object({
  productIds: z.array(z.string().trim().min(1)).max(8).default([]),
});

export function normalizeHashtag(value: string) {
  return value
    .trim()
    .replace(/^#+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function cleanHashtagLabel(value: string) {
  const normalized = normalizeHashtag(value);
  return normalized ? `#${normalized}` : '';
}
