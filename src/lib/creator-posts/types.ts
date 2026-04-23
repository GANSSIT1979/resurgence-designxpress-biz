import type { FeedMediaMetadata, FeedMediaType } from '@/lib/feed/types';

export type CreatorPostStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type CreatorPostVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
export type CreatorPostsFilterValue = 'ALL' | CreatorPostStatus;

export type CreatorPostMediaAsset = {
  id: string;
  mediaType: FeedMediaType;
  url: string;
  thumbnailUrl: string | null;
  originalFileName?: string | null;
  storageProvider?: string | null;
  storageKey?: string | null;
  contentType?: string | null;
  size?: number | null;
  durationSeconds?: number | null;
  metadata?: FeedMediaMetadata;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
};

export type CreatorPostsManagerItem = {
  id: string;
  slug?: string | null;
  creatorId: string;
  title?: string | null;
  caption?: string | null;
  summary?: string | null;
  status: CreatorPostStatus;
  visibility: CreatorPostVisibility;
  mediaType?: 'cloudflare-stream' | 'video' | 'image' | 'external' | 'none';
  mediaUrl?: string | null;
  cloudflareVideoId?: string | null;
  posterUrl?: string | null;
  thumbnailUrl?: string | null;
  hashtags: string[];
  viewsCount?: number;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  savesCount?: number;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  publishedAt?: string | Date | null;
  mediaAssets: CreatorPostMediaAsset[];
  productIds: string[];
  meta?: Record<string, unknown> | null;
};
