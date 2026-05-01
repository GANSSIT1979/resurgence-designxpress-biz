import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { formatPrismaSchemaDrift, isPrismaSchemaDriftError } from '@/lib/prisma-schema-health';
import { FeedResponse } from '@/lib/feed/types';
import { serializeContentPost, serializeGalleryEventAsFeedPost } from '@/lib/feed/serializers';

export function isMissingFeedTableError(error: unknown) {
  const code = (error as { code?: string })?.code;
  const message = error instanceof Error ? error.message : String(error || '');
  return code === 'P2021' || /does not exist|no such table|ContentPost|MediaAsset/i.test(message);
}

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

export function isPrismaDatabaseUnavailableError(error: unknown) {
  const name = (error as { name?: string })?.name ?? '';
  const message = error instanceof Error ? error.message : String(error || '');

  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    name === 'PrismaClientInitializationError' ||
    /Can't reach database server|database server is running|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|P1001|HOST:6543/i.test(message)
  );
}

function logFeedFallback(scope: string, error: unknown) {
  console.error(`[feed] Falling back to ${scope}.`, error);
}

function logLegacyFeedRetry(scope: string, error: unknown) {
  console.warn(
    `[feed] Retrying ${scope} with a legacy-safe select because the deployed database is behind the current Prisma model. ${formatPrismaSchemaDrift(
      scope,
      error,
    )}`,
  );
}

function clampLimit(limit?: number) {
  if (!Number.isFinite(limit)) return 8;
  return Math.max(1, Math.min(24, Math.floor(limit || 8)));
}

function buildPublicContentPostSelect({
  viewerId,
  legacyMode = false,
}: {
  viewerId?: string | null;
  legacyMode?: boolean;
}): Prisma.ContentPostSelect {
  return {
    id: true,
    ...(legacyMode ? {} : { title: true, slug: true }),
    caption: true,
    summary: true,
    visibility: true,
    status: true,
    isFeatured: true,
    isPinned: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    likeCount: true,
    commentCount: true,
    saveCount: true,
    shareCount: true,
    viewCount: true,
    metadataJson: true,
    authorUser: {
      select: {
        id: true,
        displayName: true,
        role: true,
      },
    },
    creatorProfile: {
      select: {
        id: true,
        name: true,
        slug: true,
        roleLabel: true,
        imageUrl: true,
        ...(viewerId
          ? {
              followers: {
                where: { followerUserId: viewerId },
                select: { followerUserId: true },
              },
            }
          : {}),
      },
    },
    mediaAssets: {
      select: {
        id: true,
        mediaType: true,
        url: true,
        thumbnailUrl: true,
        ...(legacyMode ? {} : { originalFileName: true }),
        storageProvider: true,
        storageKey: true,
        contentType: true,
        size: true,
        durationSeconds: true,
        metadataJson: true,
        altText: true,
        caption: true,
        sortOrder: true,
        createdAt: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    },
    hashtags: {
      select: {
        hashtag: {
          select: {
            id: true,
            label: true,
            normalizedName: true,
          },
        },
      },
    },
    ...(viewerId ? { likes: { where: { userId: viewerId }, select: { userId: true } } } : {}),
    ...(viewerId ? { saves: { where: { userId: viewerId }, select: { userId: true } } } : {}),
    productTags: {
      select: {
        id: true,
        productId: true,
        label: true,
        ctaLabel: true,
        sortOrder: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            price: true,
            stock: true,
            badgeLabel: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    },
    sponsoredPlacements: {
      where: { status: { in: ['APPROVED', 'ACTIVE'] } },
      select: {
        id: true,
        title: true,
        ctaLabel: true,
        ctaHref: true,
        placementType: true,
        sponsor: { select: { name: true } },
        sponsorProfile: { select: { companyName: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    },
  };
}

async function runPublicContentPostFindMany(
  args: Omit<Prisma.ContentPostFindManyArgs, 'include' | 'select'>,
  viewerId?: string | null,
) {
  if (!hasUsableDatabaseUrl()) return { items: [], usedLegacySelect: false };

  try {
    return {
      items: await prisma.contentPost.findMany({
        ...args,
        select: buildPublicContentPostSelect({ viewerId }),
      }),
      usedLegacySelect: false,
    };
  } catch (error) {
    if (!isPrismaSchemaDriftError(error)) throw error;

    logLegacyFeedRetry('public content-post reads', error);

    return {
      items: await prisma.contentPost.findMany({
        ...args,
        select: buildPublicContentPostSelect({ viewerId, legacyMode: true }),
      }),
      usedLegacySelect: true,
    };
  }
}

async function runPublicContentPostFindUnique(
  args: Omit<Prisma.ContentPostFindUniqueArgs, 'include' | 'select'>,
  viewerId?: string | null,
) {
  if (!hasUsableDatabaseUrl()) return { item: null, usedLegacySelect: false };

  try {
    return {
      item: await prisma.contentPost.findUnique({
        ...args,
        select: buildPublicContentPostSelect({ viewerId }),
      }),
      usedLegacySelect: false,
    };
  } catch (error) {
    if (!isPrismaSchemaDriftError(error)) throw error;

    logLegacyFeedRetry('public content-post detail reads', error);

    return {
      item: await prisma.contentPost.findUnique({
        ...args,
        select: buildPublicContentPostSelect({ viewerId, legacyMode: true }),
      }),
      usedLegacySelect: true,
    };
  }
}

export async function getGalleryFallbackFeed(limit = 8): Promise<FeedResponse> {
  if (!hasUsableDatabaseUrl()) {
    return {
      items: [],
      nextCursor: null,
      source: 'gallery-fallback',
    };
  }

  try {
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
  } catch (error) {
    logFeedFallback('an empty gallery feed', error);
    return {
      items: [],
      nextCursor: null,
      source: 'gallery-fallback',
    };
  }
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

  if (!hasUsableDatabaseUrl()) {
    return {
      items: [],
      nextCursor: null,
      source: 'content-post',
    };
  }

  try {
    const { items } = await runPublicContentPostFindMany(
      {
        where: {
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          mediaAssets: { some: { url: { not: '' } } },
        },
        orderBy: [{ isPinned: 'desc' }, { isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: take + 1,
      },
      viewerId,
    );

    const visibleItems = items.slice(0, take);
    if (!visibleItems.length && fallbackOnError) {
      return getGalleryFallbackFeed(take);
    }

    return {
      items: visibleItems.map((item) => serializeContentPost(item, viewerId)),
      nextCursor: items.length > take ? items[take]?.id ?? null : null,
      source: 'content-post',
    };
  } catch (error) {
    if (!fallbackOnError) throw error;
    logFeedFallback('the gallery feed after a content-post query failure', error);
    if (isPrismaDatabaseUnavailableError(error)) {
      return {
        items: [],
        nextCursor: null,
        source: 'content-post',
      };
    }
    return getGalleryFallbackFeed(take);
  }
}

export async function getCreatorPublicFeedPosts({
  creatorProfileId,
  limit = 4,
}: {
  creatorProfileId: string;
  limit?: number;
}) {
  return runPublicContentPostFindMany(
    {
      where: {
        creatorProfileId,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
      orderBy: [{ isPinned: 'desc' }, { isFeatured: 'desc' }, { publishedAt: 'desc' }],
      take: clampLimit(limit),
    },
    null,
  );
}

export async function getPromotedPlacements(limit = 4) {
  if (!hasUsableDatabaseUrl()) return [];

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
    logFeedFallback('an empty promoted placements list', error);
    return [];
  }
}

export async function getPostForApi(postId: string) {
  const { item } = await runPublicContentPostFindUnique({ where: { id: postId } }, null);
  return item;
}

export async function getPublicFeedPostMetrics(postId: string) {
  if (!hasUsableDatabaseUrl()) return null;

  const item = await prisma.contentPost.findFirst({
    where: {
      id: postId,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
    select: {
      likeCount: true,
      commentCount: true,
      saveCount: true,
      shareCount: true,
      viewCount: true,
    },
  });

  if (!item) return null;

  return {
    likes: item.likeCount ?? 0,
    comments: item.commentCount ?? 0,
    saves: item.saveCount ?? 0,
    shares: item.shareCount ?? 0,
    views: item.viewCount ?? 0,
  };
}
