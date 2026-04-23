import {
  getCloudflareStreamVideoId,
  isCloudflareStreamAsset,
} from '@/lib/cloudflare-stream';
import type { FeedPost } from '@/lib/feed/types';
import type {
  CreatorPostStatus,
  CreatorPostsFilterValue,
  CreatorPostsManagerItem,
} from '@/lib/creator-posts/types';

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function formatCompactNumber(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateLabel(value?: string | Date | null) {
  if (!value) return 'No date';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'No date';

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function normalizeCreatorPostStatus(value: string | null | undefined): CreatorPostStatus {
  if (value === 'PUBLISHED') return 'PUBLISHED';
  if (value === 'PENDING_REVIEW') return 'PENDING_REVIEW';
  if (value === 'ARCHIVED' || value === 'HIDDEN') return 'ARCHIVED';
  return 'DRAFT';
}

export function mapFeedPostToCreatorPostsManagerItem(post: FeedPost): CreatorPostsManagerItem {
  const primaryMedia = post.mediaAssets[0] ?? null;
  const metadata = asRecord(primaryMedia?.metadata);
  const isCloudflare =
    primaryMedia &&
    isCloudflareStreamAsset({
      url: primaryMedia.url,
      storageProvider: primaryMedia.storageProvider,
      storageKey: primaryMedia.storageKey,
      metadata,
    });

  const cloudflareVideoId =
    primaryMedia && isCloudflare
      ? getCloudflareStreamVideoId({
          url: primaryMedia.url,
          storageProvider: primaryMedia.storageProvider,
          storageKey: primaryMedia.storageKey,
          metadata,
        })
      : '';

  return {
    id: post.id,
    slug: post.slug ?? null,
    creatorId: post.creator?.id ?? 'creator',
    title: post.title ?? null,
    caption: post.caption,
    summary: post.summary ?? null,
    status: normalizeCreatorPostStatus(post.status),
    visibility: (post.visibility as CreatorPostsManagerItem['visibility']) || 'PUBLIC',
    mediaType: isCloudflare
      ? 'cloudflare-stream'
      : primaryMedia?.mediaType === 'IMAGE'
        ? 'image'
        : primaryMedia?.mediaType === 'VIDEO'
          ? 'video'
          : primaryMedia
            ? 'external'
            : 'none',
    mediaUrl: primaryMedia?.url ?? null,
    cloudflareVideoId: cloudflareVideoId || null,
    posterUrl: primaryMedia?.thumbnailUrl ?? null,
    thumbnailUrl: primaryMedia?.thumbnailUrl ?? null,
    hashtags: post.hashtags.map((tag) => tag.label.replace(/^#/, '')),
    viewsCount: post.metrics.views,
    likesCount: post.metrics.likes,
    commentsCount: post.metrics.comments,
    sharesCount: post.metrics.shares,
    savesCount: post.metrics.saves,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
    mediaAssets: post.mediaAssets,
    productIds: post.productTags.map((tag) => tag.productId).filter(Boolean) as string[],
    meta: post.meta ?? null,
  };
}

export function mapFeedPostsToCreatorPostsManagerItems(posts: FeedPost[]) {
  return posts.map(mapFeedPostToCreatorPostsManagerItem);
}

export function sortPostsByRecency(posts: CreatorPostsManagerItem[]) {
  return [...posts].sort((left, right) => {
    const leftTime = new Date(left.publishedAt || left.updatedAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.publishedAt || right.updatedAt || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

export function filterPostsByStatus(posts: CreatorPostsManagerItem[], filter: CreatorPostsFilterValue) {
  if (filter === 'ALL') return posts;
  return posts.filter((post) => post.status === filter);
}

export function summarizePosts(posts: CreatorPostsManagerItem[]) {
  const total = posts.length;
  const published = posts.filter((post) => post.status === 'PUBLISHED').length;
  const drafts = posts.filter((post) => post.status === 'DRAFT').length;
  const inReview = posts.filter((post) => post.status === 'PENDING_REVIEW').length;
  const archived = posts.filter((post) => post.status === 'ARCHIVED').length;
  const totalViews = posts.reduce((sum, post) => sum + (post.viewsCount || 0), 0);

  return { total, published, drafts, inReview, archived, totalViews };
}
