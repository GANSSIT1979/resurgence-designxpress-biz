import { FeedPost } from '@/lib/feed/types';

function iso(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function sortItems<T extends { sortOrder?: number | null; createdAt?: Date | string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const order = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    if (order !== 0) return order;
    return new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime();
  });
}

export function serializeContentPost(item: any, viewerId?: string | null): FeedPost {
  const likes = item.likes || [];
  const saves = item.saves || [];
  const follows = item.creatorProfile?.followers || [];

  return {
    id: item.id,
    caption: item.caption,
    summary: item.summary,
    status: item.status,
    visibility: item.visibility,
    isFeatured: item.isFeatured,
    isPinned: item.isPinned,
    publishedAt: iso(item.publishedAt),
    createdAt: iso(item.createdAt) || new Date().toISOString(),
    updatedAt: iso(item.updatedAt) || new Date().toISOString(),
    creator: item.creatorProfile
      ? {
          id: item.creatorProfile.id,
          name: item.creatorProfile.name,
          slug: item.creatorProfile.slug,
          roleLabel: item.creatorProfile.roleLabel,
          imageUrl: item.creatorProfile.imageUrl,
        }
      : null,
    author: item.authorUser
      ? {
          id: item.authorUser.id,
          displayName: item.authorUser.displayName,
          role: item.authorUser.role,
        }
      : null,
    mediaAssets: sortItems(item.mediaAssets || []).map((asset: any) => ({
      id: asset.id,
      mediaType: asset.mediaType,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      altText: asset.altText,
      caption: asset.caption,
      sortOrder: asset.sortOrder,
    })),
    hashtags: (item.hashtags || []).map((entry: any) => ({
      id: entry.hashtag.id,
      label: entry.hashtag.label,
      normalizedName: entry.hashtag.normalizedName,
    })),
    productTags: sortItems(item.productTags || []).map((tag: any) => ({
      id: tag.id,
      productId: tag.product?.id ?? tag.productId ?? null,
      name: tag.label || tag.product?.name || 'Official Resurgence Merch',
      slug: tag.product?.slug ?? null,
      imageUrl: tag.product?.imageUrl ?? null,
      price: tag.product?.price ?? null,
      stock: tag.product?.stock ?? null,
      label: tag.label || tag.product?.badgeLabel || 'Official merch',
      ctaLabel: tag.ctaLabel || 'View merch',
    })),
    sponsorPlacements: (item.sponsoredPlacements || []).map((placement: any) => ({
      id: placement.id,
      title: placement.title,
      sponsorName: placement.sponsor?.name || placement.sponsorProfile?.companyName || null,
      ctaLabel: placement.ctaLabel,
      ctaHref: placement.ctaHref,
      placementType: placement.placementType,
    })),
    metrics: {
      likes: item.likeCount ?? 0,
      comments: item.commentCount ?? 0,
      saves: item.saveCount ?? 0,
      shares: item.shareCount ?? 0,
      views: item.viewCount ?? 0,
    },
    viewerState: viewerId
      ? {
          liked: likes.some((like: any) => like.userId === viewerId),
          saved: saves.some((save: any) => save.userId === viewerId),
          followingCreator: follows.some((follow: any) => follow.followerUserId === viewerId),
        }
      : undefined,
    source: 'content-post',
  };
}

export function serializeGalleryEventAsFeedPost(event: any): FeedPost {
  return {
    id: `gallery-${event.id}`,
    caption: event.title,
    summary: event.description,
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    isFeatured: false,
    isPinned: false,
    publishedAt: iso(event.eventDate || event.createdAt),
    createdAt: iso(event.createdAt) || new Date().toISOString(),
    updatedAt: iso(event.updatedAt) || new Date().toISOString(),
    creator: event.creator
      ? {
          id: event.creator.id,
          name: event.creator.name,
          slug: event.creator.slug,
          roleLabel: event.creator.roleLabel,
          imageUrl: event.creator.imageUrl,
        }
      : null,
    author: null,
    mediaAssets: sortItems(event.mediaItems || []).map((item: any) => ({
      id: item.id,
      mediaType: item.mediaType,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      altText: item.caption,
      caption: item.caption,
      sortOrder: item.sortOrder,
    })),
    hashtags: [
      { id: `fallback-${event.id}-resurgence`, label: '#resurgence', normalizedName: 'resurgence' },
      { id: `fallback-${event.id}-basketball`, label: '#basketball', normalizedName: 'basketball' },
    ],
    productTags: [],
    sponsorPlacements: [],
    metrics: { likes: 0, comments: 0, saves: 0, shares: 0, views: 0 },
    source: 'gallery-fallback',
  };
}
