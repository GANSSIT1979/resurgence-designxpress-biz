export type FeedMediaType = 'IMAGE' | 'VIDEO' | 'YOUTUBE' | 'VIMEO' | 'EXTERNAL';

export type FeedMediaMetadata = Record<string, unknown> | null;

export type FeedPost = {
  id: string;
  title?: string | null;
  caption: string;
  summary: string | null;
  slug?: string | null;
  meta?: FeedMediaMetadata;
  status: string;
  visibility: string;
  isFeatured: boolean;
  isPinned: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    slug: string;
    roleLabel: string;
    imageUrl: string | null;
  } | null;
  author: {
    id: string;
    displayName: string;
    role: string;
  } | null;
  mediaAssets: Array<{
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
  }>;
  hashtags: Array<{
    id: string;
    label: string;
    normalizedName: string;
  }>;
  productTags: Array<{
    id: string;
    productId: string | null;
    name: string;
    slug: string | null;
    imageUrl: string | null;
    price: number | null;
    stock: number | null;
    label: string;
    ctaLabel: string;
  }>;
  sponsorPlacements: Array<{
    id: string;
    title: string;
    sponsorName: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    placementType: string;
  }>;
  metrics: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
    views: number;
  };
  viewerState?: {
    liked: boolean;
    saved: boolean;
    followingCreator: boolean;
  };
  source: 'content-post' | 'gallery-fallback';
};

export type FeedResponse = {
  items: FeedPost[];
  nextCursor: string | null;
  source: 'content-post' | 'gallery-fallback';
};
