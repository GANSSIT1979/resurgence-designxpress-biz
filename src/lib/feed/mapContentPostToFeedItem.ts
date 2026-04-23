import {
  buildCloudflareStreamEmbedUrl,
  buildCloudflareStreamThumbnailUrl,
  CLOUDFLARE_STREAM_STORAGE_PROVIDER,
  normalizeCloudflareCustomerCode,
} from '@/lib/cloudflare-stream';
import type { FeedMediaType, FeedPost } from '@/lib/feed/types';

type PreviewCreator = Partial<NonNullable<FeedPost['creator']>>;

type ContentPostPreviewLike = {
  id?: string | null;
  postId?: string | null;
  creatorId?: string | null;
  title?: string | null;
  caption?: string | null;
  summary?: string | null;
  slug?: string | null;
  status?: string | null;
  visibility?: string | null;
  mediaType?: string | null;
  cloudflareVideoId?: string | null;
  customerCode?: string | null;
  mediaUrl?: string | null;
  previewURL?: string | null;
  url?: string | null;
  posterUrl?: string | null;
  thumbnailUrl?: string | null;
  hashtags?: unknown;
  creator?: PreviewCreator | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  savesCount?: number | null;
  sharesCount?: number | null;
  viewsCount?: number | null;
  liked?: boolean | null;
  saved?: boolean | null;
  following?: boolean | null;
};

type MapOptions = {
  creator?: PreviewCreator | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asText(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function asNullableText(value: unknown) {
  const text = asText(value);
  return text || null;
}

function normalizeHashtagValue(value: unknown) {
  const raw =
    typeof value === 'string'
      ? value
      : isRecord(value) && typeof value.label === 'string'
        ? value.label
        : isRecord(value) && typeof value.normalizedName === 'string'
          ? value.normalizedName
          : '';

  return raw
    .trim()
    .replace(/^#+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeHashtags(value: unknown): FeedPost['hashtags'] {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(value.map(normalizeHashtagValue).filter(Boolean))).map(
    (normalizedName, index) => ({
      id: `preview-tag-${index}-${normalizedName}`,
      label: `#${normalizedName}`,
      normalizedName,
    }),
  );
}

function normalizeMediaType(value: unknown, hasVideoId: boolean): FeedMediaType {
  const mediaType = asText(value).toUpperCase();

  if (mediaType === 'IMAGE') return 'IMAGE';
  if (mediaType === 'VIDEO') return 'VIDEO';
  if (mediaType === 'YOUTUBE') return 'YOUTUBE';
  if (mediaType === 'VIMEO') return 'VIMEO';
  if (mediaType === 'EXTERNAL') return 'EXTERNAL';

  return hasVideoId ? 'VIDEO' : 'EXTERNAL';
}

function nowIso() {
  return new Date().toISOString();
}

export function mapContentPostToFeedItem(
  value: ContentPostPreviewLike | FeedPost,
  options: MapOptions = {},
): FeedPost {
  const candidate = value as Partial<FeedPost>;

  if (
    isRecord(value) &&
    Array.isArray(candidate.mediaAssets) &&
    isRecord(candidate.metrics) &&
    typeof candidate.id === 'string'
  ) {
    return value as FeedPost;
  }

  const item = value as ContentPostPreviewLike;
  const creatorSource = options.creator || item.creator || null;
  const creatorId = asText(creatorSource?.id) || asText(item.creatorId) || 'creator-preview';
  const customerCode = normalizeCloudflareCustomerCode(item.customerCode);
  const cloudflareVideoId = asText(item.cloudflareVideoId);
  const mediaUrl =
    asText(item.mediaUrl) ||
    asText(item.previewURL) ||
    asText(item.url) ||
    (cloudflareVideoId && customerCode
      ? buildCloudflareStreamEmbedUrl({ customerCode, videoId: cloudflareVideoId })
      : '');
  const thumbnailUrl =
    asText(item.thumbnailUrl) ||
    asText(item.posterUrl) ||
    (cloudflareVideoId && customerCode
      ? buildCloudflareStreamThumbnailUrl({ customerCode, videoId: cloudflareVideoId })
      : '');
  const mediaType = normalizeMediaType(item.mediaType, Boolean(cloudflareVideoId));
  const createdAt = nowIso();

  return {
    id: asText(item.postId) || asText(item.id) || cloudflareVideoId || 'preview-post',
    title: asNullableText(item.title),
    caption:
      asNullableText(item.caption) ||
      asNullableText(item.title) ||
      'Your creator post preview will appear here after upload.',
    summary: asNullableText(item.summary),
    slug: asNullableText(item.slug),
    meta: cloudflareVideoId
      ? {
          source: 'creator-post-preview',
          cloudflareVideoId,
          customerCode: customerCode || null,
        }
      : null,
    status: asText(item.status) || 'DRAFT',
    visibility: asText(item.visibility) || 'PUBLIC',
    isFeatured: false,
    isPinned: false,
    publishedAt: null,
    createdAt,
    updatedAt: createdAt,
    creator: {
      id: creatorId,
      name: asText(creatorSource?.name) || 'Creator Studio',
      slug: asText(creatorSource?.slug) || 'creator',
      roleLabel: asText(creatorSource?.roleLabel) || 'Creator',
      imageUrl: asNullableText(creatorSource?.imageUrl),
    },
    author: null,
    mediaAssets: mediaUrl
      ? [
          {
            id: `preview-media-${cloudflareVideoId || 'asset'}`,
            mediaType,
            url: mediaUrl,
            thumbnailUrl: thumbnailUrl || null,
            originalFileName: null,
            storageProvider: cloudflareVideoId ? CLOUDFLARE_STREAM_STORAGE_PROVIDER : null,
            storageKey: cloudflareVideoId || null,
            contentType: 'video/mp4',
            size: null,
            durationSeconds: null,
            metadata: cloudflareVideoId
              ? {
                  cloudflareVideoId,
                  customerCode: customerCode || null,
                }
              : null,
            altText: asNullableText(item.caption) || asNullableText(item.title),
            caption: asNullableText(item.title),
            sortOrder: 0,
          },
        ]
      : [],
    hashtags: normalizeHashtags(item.hashtags),
    productTags: [],
    sponsorPlacements: [],
    metrics: {
      likes: typeof item.likesCount === 'number' ? item.likesCount : 0,
      comments: typeof item.commentsCount === 'number' ? item.commentsCount : 0,
      saves: typeof item.savesCount === 'number' ? item.savesCount : 0,
      shares: typeof item.sharesCount === 'number' ? item.sharesCount : 0,
      views: typeof item.viewsCount === 'number' ? item.viewsCount : 0,
    },
    viewerState: {
      liked: Boolean(item.liked),
      saved: Boolean(item.saved),
      followingCreator: Boolean(item.following),
    },
    source: 'content-post',
  };
}
