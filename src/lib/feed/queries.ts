import { prisma } from '@/lib/prisma';
import { FeedResponse } from '@/lib/feed/types';
import { serializeContentPost, serializeGalleryEventAsFeedPost } from '@/lib/feed/serializers';

export function isMissingFeedTableError(error: unknown) {
  const code = (error as { code?: string })?.code;
  const message = error instanceof Error ? error.message : String(error || '');
  return code === 'P2021' || /does not exist|no such table|ContentPost|MediaAsset/i.test(message);
}

function clampLimit(limit?: number) {
  if (!Number.isFinite(limit)) return 8;
  return Math.max(1, Math.min(24, Math.floor(limit || 8)));
}

export async function getGalleryFallbackFeed(limit = 8): Promise<FeedResponse> {
  const events = await prisma.mediaEvent.findMany({
    where: { isActive: true },
    include: {
      creator: true,
      mediaItems: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
    orderBy: [{ sortOrder: 'asc' }, { eventDate: 'desc' }, { createdAt: 'desc' }],
    take: clampLimit(limit),
  });

  return {
    items: events.filter((event) => event.mediaItems.some((item) => item.url)).map(serializeGalleryEventAsFeedPost),
    nextCursor: null,
    source: 'gallery-fallback',
  };
}

export async function getPublicFeed({
  cursor,
  limit = 8,
  viewerId,
  fallbackOnError = true,
}: {
  cursor?: string | null;
  limit?: number;
  viewerId?: string | null;
  fallbackOnError?: boolean;
} = {}): Promise<FeedResponse> {
  const take = clampLimit(limit);

  try {
    const items = await prisma.contentPost.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        mediaAssets: { some: { url: { not: '' } } },
      },
      include: {
        authorUser: { select: { id: true, displayName: true, role: true } },
        creatorProfile: {
          select: {
            id: true,
            name: true,
            slug: true,
            roleLabel: true,
            imageUrl: true,
            ...(viewerId ? { followers: { where: { followerUserId: viewerId }, select: { followerUserId: true } } } : {}),
          },
        },
        mediaAssets: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        hashtags: { include: { hashtag: true } },
        ...(viewerId ? { likes: { where: { userId: viewerId }, select: { userId: true } } } : {}),
        ...(viewerId ? { saves: { where: { userId: viewerId }, select: { userId: true } } } : {}),
        productTags: { include: { product: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        sponsoredPlacements: {
          where: { status: { in: ['APPROVED', 'ACTIVE'] } },
          include: { sponsor: true, sponsorProfile: true },
          orderBy: [{ createdAt: 'desc' }],
        },
      },
      orderBy: [{ isPinned: 'desc' }, { isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: take + 1,
    });

    const visibleItems = items.slice(0, take);

    return {
      items: visibleItems.map((item) => serializeContentPost(item, viewerId)),
      nextCursor: items.length > take ? items[take]?.id ?? null : null,
      source: 'content-post',
    };
  } catch (error) {
    if (!fallbackOnError || !isMissingFeedTableError(error)) throw error;
    return getGalleryFallbackFeed(take);
  }
}

export async function getPromotedPlacements(limit = 4) {
  try {
    return await prisma.sponsoredPlacement.findMany({
      where: {
        status: { in: ['APPROVED', 'ACTIVE'] },
        OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }],
      },
      include: { sponsor: true, sponsorProfile: true, product: true, post: true },
      orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
      take: clampLimit(limit),
    });
  } catch (error) {
    if (isMissingFeedTableError(error)) return [];
    throw error;
  }
}

export async function getPostForApi(postId: string) {
  return prisma.contentPost.findUnique({
    where: { id: postId },
    include: {
      authorUser: { select: { id: true, displayName: true, role: true } },
      creatorProfile: true,
      mediaAssets: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      hashtags: { include: { hashtag: true } },
      productTags: { include: { product: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      sponsoredPlacements: { include: { sponsor: true, sponsorProfile: true } },
    },
  });
}
