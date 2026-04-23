import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fail, ok } from '@/lib/api-utils';
import {
  buildCloudflareStreamEmbedUrl,
  buildCloudflareStreamThumbnailUrl,
  CLOUDFLARE_STREAM_STORAGE_PROVIDER,
  normalizeCloudflareCustomerCode,
} from '@/lib/cloudflare-stream';
import { requireFeedActor, feedRouteError } from '@/lib/feed/api';
import { canCreateFeedPost, canManageAnyFeedPost } from '@/lib/feed/authorization';
import { createFeedPost } from '@/lib/feed/mutations';
import type { FeedPost } from '@/lib/feed/types';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}, z.string().url().optional());

const optionalText = z.preprocess((value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}, z.string().optional());

const createCreatorPostBodySchema = z.object({
  creatorId: z.string().trim().min(1).max(120),
  cloudflareVideoId: z.string().trim().min(1).max(200),
  caption: optionalText,
  title: optionalText,
  summary: optionalText,
  originalFileName: optionalText,
  status: z.enum(['DRAFT', 'PUBLISHED', 'PENDING_REVIEW']).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'MEMBERS_ONLY']).optional(),
  hashtags: z.array(z.string().trim().min(1).max(50)).max(12).optional().default([]),
  posterUrl: optionalUrl,
  thumbnailUrl: optionalUrl,
  slug: optionalText,
  meta: z.record(z.string(), z.unknown()).optional(),
});

function buildCaption(input: z.infer<typeof createCreatorPostBodySchema>) {
  const caption =
    input.caption?.trim() ||
    input.title?.trim() ||
    input.originalFileName?.trim() ||
    '';

  return caption.length >= 2 ? caption.slice(0, 2200) : 'New creator video';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function buildSlug(input: z.infer<typeof createCreatorPostBodySchema>) {
  const preferred = input.slug?.trim();
  if (preferred) return slugify(preferred);

  const base = input.title?.trim() || input.caption?.trim();
  if (base) {
    const normalized = slugify(base);
    if (normalized) {
      const suffix = slugify(input.cloudflareVideoId).slice(-8);
      return suffix ? `${normalized.slice(0, 111)}-${suffix}` : normalized;
    }
  }

  return `video-${slugify(input.cloudflareVideoId).slice(0, 32)}`;
}

function buildFeedPreview(item: FeedPost, fallback: z.infer<typeof createCreatorPostBodySchema>) {
  const primaryMedia = item.mediaAssets[0] ?? null;
  const metadata =
    primaryMedia?.metadata && typeof primaryMedia.metadata === 'object'
      ? primaryMedia.metadata
      : null;
  const metadataVideoId =
    metadata && typeof metadata.cloudflareVideoId === 'string'
      ? metadata.cloudflareVideoId
      : null;

  return {
    id: item.id,
    creatorId: item.creator?.id ?? fallback.creatorId,
    caption: item.caption,
    status: item.status,
    visibility: item.visibility,
    mediaType: primaryMedia?.mediaType ?? 'VIDEO',
    cloudflareVideoId:
      primaryMedia?.storageKey || metadataVideoId || fallback.cloudflareVideoId,
    thumbnailUrl:
      primaryMedia?.thumbnailUrl || fallback.thumbnailUrl || fallback.posterUrl || null,
    title:
      item.title ||
      fallback.title ||
      primaryMedia?.originalFileName ||
      primaryMedia?.caption ||
      (typeof metadata?.title === 'string' ? metadata.title : null),
    slug: item.slug || fallback.slug || null,
    postId: item.id,
  };
}

export async function POST(request: NextRequest) {
  const { actor, error } = await requireFeedActor(request);
  if (error || !actor) return error;
  if (!canCreateFeedPost(actor.role)) {
    return fail('Forbidden. Creator, staff, or admin access is required.', 403);
  }

  try {
    const payload = await request.json().catch(() => null);
    const parsed = createCreatorPostBodySchema.safeParse(payload);
    if (!parsed.success) {
      return fail('Invalid creator post payload. Provide creatorId and cloudflareVideoId.', 400);
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { id: parsed.data.creatorId },
      select: {
        id: true,
        userId: true,
        name: true,
        slug: true,
      },
    });

    if (!creatorProfile) {
      return fail('Creator profile not found.', 404);
    }

    if (!canManageAnyFeedPost(actor.role) && creatorProfile.userId !== actor.id) {
      return fail('Forbidden. You can only create posts for your own creator profile.', 403);
    }

    const customerCode = normalizeCloudflareCustomerCode(
      process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE,
    );
    if (!customerCode) {
      return fail(
        'Missing CLOUDFLARE_STREAM_CUSTOMER_CODE. Configure Cloudflare Stream playback before saving uploaded videos.',
        500,
      );
    }

    const previewUrl = buildCloudflareStreamEmbedUrl({
      customerCode,
      videoId: parsed.data.cloudflareVideoId,
    });
    const thumbnailUrl =
      parsed.data.thumbnailUrl ||
      parsed.data.posterUrl ||
      buildCloudflareStreamThumbnailUrl({
        customerCode,
        videoId: parsed.data.cloudflareVideoId,
      });

    if (!previewUrl) {
      return fail('Unable to build a Cloudflare Stream playback URL for this upload.', 400);
    }

    const caption = buildCaption(parsed.data);
    const summary = parsed.data.summary?.slice(0, 280) || parsed.data.title?.slice(0, 280) || '';
    const mediaCaption = parsed.data.title || parsed.data.originalFileName || '';
    const slug = buildSlug(parsed.data);
    const mediaMetadata = {
      source: 'cloudflare-stream-direct-upload',
      cloudflareVideoId: parsed.data.cloudflareVideoId,
      customerCode,
      originalFileName: parsed.data.originalFileName,
      title: parsed.data.title,
      slug,
      ...(parsed.data.meta || {}),
    };

    const result = await createFeedPost(actor, {
      creatorProfileId: creatorProfile.id,
      title: parsed.data.title,
      caption,
      summary,
      slug,
      meta: {
        source: 'cloudflare-stream-direct-upload',
        cloudflareVideoId: parsed.data.cloudflareVideoId,
        customerCode,
        ...(parsed.data.meta || {}),
      },
      visibility: parsed.data.visibility ?? 'PUBLIC',
      status: parsed.data.status ?? 'DRAFT',
      mediaAssets: [
        {
          mediaType: 'VIDEO',
          url: previewUrl,
          thumbnailUrl,
          originalFileName: parsed.data.originalFileName,
          storageProvider: CLOUDFLARE_STREAM_STORAGE_PROVIDER,
          storageKey: parsed.data.cloudflareVideoId,
          altText: caption,
          caption: mediaCaption,
          metadata: mediaMetadata,
          sortOrder: 0,
        },
      ],
      hashtags: parsed.data.hashtags,
      productIds: [],
    });

    if ('error' in result && result.error) {
      return fail(result.error, 400);
    }

    if (!result.item) {
      return fail('The creator post saved, but no feed item was returned.', 500);
    }

    return ok(
      {
        item: result.item,
        feedPreview: buildFeedPreview(result.item, parsed.data),
      },
      201,
    );
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}
