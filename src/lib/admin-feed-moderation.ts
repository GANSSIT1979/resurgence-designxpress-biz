import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const optionalText = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z.string().optional().default(''),
);

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}, z.union([z.string().url(), z.literal('')]).default(''));

const optionalDate = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z.string().optional().default('').refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Use a valid date.'),
);

const adminPostModerationSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'HIDDEN', 'ARCHIVED', 'DELETED']).optional(),
  visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE']).optional(),
  isFeatured: z.coerce.boolean().optional(),
  isPinned: z.coerce.boolean().optional(),
  moderationReason: optionalText,
});

const adminPlacementModerationSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'REJECTED']).optional(),
  startsAt: optionalDate,
  endsAt: optionalDate,
  ctaLabel: optionalText,
  ctaHref: optionalUrl,
  budgetAmount: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
  impressionGoal: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
  moderationNote: optionalText,
}).refine((value) => !value.startsAt || !value.endsAt || new Date(value.endsAt) >= new Date(value.startsAt), {
  message: 'End date must be after the start date.',
  path: ['endsAt'],
});

export const adminFeedPostInclude = {
  authorUser: { select: { id: true, displayName: true, email: true, role: true } },
  creatorProfile: { select: { id: true, name: true, slug: true, roleLabel: true, imageUrl: true } },
  mediaAssets: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
  hashtags: { include: { hashtag: true }, orderBy: { createdAt: 'asc' } },
  productTags: {
    include: {
      product: { select: { id: true, name: true, slug: true, imageUrl: true, price: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
  sponsoredPlacements: {
    include: {
      sponsor: { select: { id: true, name: true, tier: true } },
      sponsorProfile: { select: { id: true, companyName: true } },
    },
  },
} satisfies Prisma.ContentPostInclude;

export const adminPlacementInclude = {
  sponsor: { select: { id: true, name: true, tier: true } },
  sponsorProfile: { select: { id: true, companyName: true, contactName: true, contactEmail: true } },
  product: { select: { id: true, name: true, slug: true, imageUrl: true, price: true } },
  post: {
    select: {
      id: true,
      caption: true,
      status: true,
      visibility: true,
      publishedAt: true,
      creatorProfile: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.SponsoredPlacementInclude;

function iso(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function nullableText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

function nullableDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nullableNumber(value: string | number | undefined) {
  if (value === '' || value === undefined || value === null) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function metadataWithModerationNote(existing: unknown, note: string) {
  if (!note) return existing as any;
  const base = existing && typeof existing === 'object' && !Array.isArray(existing) ? existing as Record<string, unknown> : {};
  return { ...base, moderationNote: note, moderationNoteUpdatedAt: new Date().toISOString() };
}

export function serializeAdminFeedPost(item: any) {
  return {
    id: item.id,
    caption: item.caption,
    summary: item.summary ?? null,
    status: item.status,
    visibility: item.visibility,
    isFeatured: item.isFeatured,
    isPinned: item.isPinned,
    moderationReason: item.moderationReason ?? '',
    publishedAt: iso(item.publishedAt),
    archivedAt: iso(item.archivedAt),
    createdAt: iso(item.createdAt) || new Date().toISOString(),
    updatedAt: iso(item.updatedAt) || new Date().toISOString(),
    metrics: {
      likes: item.likeCount ?? 0,
      comments: item.commentCount ?? 0,
      saves: item.saveCount ?? 0,
      shares: item.shareCount ?? 0,
      views: item.viewCount ?? 0,
    },
    author: item.authorUser
      ? {
          id: item.authorUser.id,
          displayName: item.authorUser.displayName,
          email: item.authorUser.email,
          role: item.authorUser.role,
        }
      : null,
    creator: item.creatorProfile
      ? {
          id: item.creatorProfile.id,
          name: item.creatorProfile.name,
          slug: item.creatorProfile.slug,
          roleLabel: item.creatorProfile.roleLabel,
          imageUrl: item.creatorProfile.imageUrl,
        }
      : null,
    media: (item.mediaAssets || []).map((asset: any) => ({
      id: asset.id,
      mediaType: asset.mediaType,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl ?? null,
      altText: asset.altText ?? null,
    })),
    hashtags: (item.hashtags || []).map((entry: any) => ({
      id: entry.hashtag.id,
      label: entry.hashtag.label,
    })),
    productTags: (item.productTags || []).map((tag: any) => ({
      id: tag.id,
      label: tag.label || tag.product?.name || 'Merch tag',
      productName: tag.product?.name ?? null,
      productSlug: tag.product?.slug ?? null,
    })),
    placementCount: item.sponsoredPlacements?.length ?? 0,
  };
}

export function serializeAdminPlacement(item: any) {
  const metadata = item.metadataJson && typeof item.metadataJson === 'object' && !Array.isArray(item.metadataJson)
    ? item.metadataJson as Record<string, unknown>
    : {};

  return {
    id: item.id,
    title: item.title,
    placementType: item.placementType,
    status: item.status,
    startsAt: iso(item.startsAt),
    endsAt: iso(item.endsAt),
    ctaLabel: item.ctaLabel ?? '',
    ctaHref: item.ctaHref ?? '',
    budgetAmount: item.budgetAmount ?? null,
    impressionGoal: item.impressionGoal ?? null,
    impressionCount: item.impressionCount ?? 0,
    clickCount: item.clickCount ?? 0,
    moderationNote: typeof metadata.moderationNote === 'string' ? metadata.moderationNote : '',
    createdAt: iso(item.createdAt) || new Date().toISOString(),
    updatedAt: iso(item.updatedAt) || new Date().toISOString(),
    sponsor: item.sponsor
      ? { id: item.sponsor.id, name: item.sponsor.name, tier: item.sponsor.tier }
      : null,
    sponsorProfile: item.sponsorProfile
      ? {
          id: item.sponsorProfile.id,
          companyName: item.sponsorProfile.companyName,
          contactName: item.sponsorProfile.contactName,
          contactEmail: item.sponsorProfile.contactEmail,
        }
      : null,
    post: item.post
      ? {
          id: item.post.id,
          caption: item.post.caption,
          status: item.post.status,
          visibility: item.post.visibility,
          publishedAt: iso(item.post.publishedAt),
          creatorName: item.post.creatorProfile?.name ?? null,
        }
      : null,
    product: item.product
      ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          imageUrl: item.product.imageUrl ?? null,
          price: item.product.price,
        }
      : null,
  };
}

export async function getAdminFeedModerationData() {
  const [posts, placements] = await Promise.all([
    prisma.contentPost.findMany({
      where: { status: { not: 'DELETED' } },
      include: adminFeedPostInclude,
      orderBy: [{ status: 'asc' }, { isPinned: 'desc' }, { updatedAt: 'desc' }],
      take: 100,
    }),
    prisma.sponsoredPlacement.findMany({
      include: adminPlacementInclude,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take: 100,
    }),
  ]);

  return {
    posts: posts.map(serializeAdminFeedPost),
    placements: placements.map(serializeAdminPlacement),
  };
}

export async function updateAdminFeedPost(postId: string, body: unknown) {
  const parsed = adminPostModerationSchema.safeParse(body);
  if (!parsed.success) return { error: 'Invalid feed post moderation payload.' };

  const existing = await prisma.contentPost.findUnique({
    where: { id: postId },
    select: { id: true, publishedAt: true },
  });
  if (!existing) return { error: 'Feed post not found.', status: 404 };

  const data: any = {
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.visibility ? { visibility: parsed.data.visibility } : {}),
    ...(parsed.data.isFeatured !== undefined ? { isFeatured: parsed.data.isFeatured } : {}),
    ...(parsed.data.isPinned !== undefined ? { isPinned: parsed.data.isPinned } : {}),
    ...(parsed.data.moderationReason !== undefined ? { moderationReason: nullableText(parsed.data.moderationReason) } : {}),
  };

  if (parsed.data.status === 'PUBLISHED' && !existing.publishedAt) data.publishedAt = new Date();
  if (parsed.data.status === 'PUBLISHED') data.archivedAt = null;
  if (parsed.data.status === 'ARCHIVED' || parsed.data.status === 'DELETED') data.archivedAt = new Date();

  const item = await prisma.contentPost.update({
    where: { id: postId },
    data,
    include: adminFeedPostInclude,
  });

  return { item: serializeAdminFeedPost(item) };
}

export async function updateAdminPlacement(placementId: string, body: unknown) {
  const parsed = adminPlacementModerationSchema.safeParse(body);
  if (!parsed.success) return { error: 'Invalid placement moderation payload.' };

  const existing = await prisma.sponsoredPlacement.findUnique({
    where: { id: placementId },
    select: { id: true, metadataJson: true },
  });
  if (!existing) return { error: 'Placement request not found.', status: 404 };

  const item = await prisma.sponsoredPlacement.update({
    where: { id: placementId },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      startsAt: nullableDate(parsed.data.startsAt),
      endsAt: nullableDate(parsed.data.endsAt),
      ctaLabel: nullableText(parsed.data.ctaLabel),
      ctaHref: nullableText(parsed.data.ctaHref),
      budgetAmount: nullableNumber(parsed.data.budgetAmount),
      impressionGoal: nullableNumber(parsed.data.impressionGoal),
      metadataJson: metadataWithModerationNote(existing.metadataJson, parsed.data.moderationNote),
    },
    include: adminPlacementInclude,
  });

  return { item: serializeAdminPlacement(item) };
}
