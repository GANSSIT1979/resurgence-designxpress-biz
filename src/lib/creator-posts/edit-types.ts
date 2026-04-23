export type CreatorPostEditVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';

export type CreatorPostEditableRecord = {
  id: string;
  creatorId: string;
  creatorName?: string | null;
  creatorSlug?: string | null;
  creatorRoleLabel?: string | null;
  slug?: string | null;
  title?: string | null;
  caption?: string | null;
  hashtags?: string[];
  visibility: CreatorPostEditVisibility;
  mediaType?: 'cloudflare-stream' | 'video' | 'image' | 'external' | 'none' | string | null;
  mediaUrl?: string | null;
  cloudflareVideoId?: string | null;
  posterUrl?: string | null;
  thumbnailUrl?: string | null;
  originalFileName?: string | null;
  durationSeconds?: number | null;
  aspectRatio?: string | null;
  altText?: string | null;
  locationLabel?: string | null;
  languageCode?: string | null;
  status?: string | null;
  meta?: Record<string, unknown> | null;
  updatedAt?: string | Date | null;
  publishedAt?: string | Date | null;
};

export type CreatorPostEditPayload = {
  title?: string | null;
  caption?: string | null;
  hashtags?: string[];
  visibility?: CreatorPostEditVisibility;
  posterUrl?: string | null;
  thumbnailUrl?: string | null;
  originalFileName?: string | null;
  durationSeconds?: number | null;
  aspectRatio?: string | null;
  altText?: string | null;
  locationLabel?: string | null;
  languageCode?: string | null;
  meta?: Record<string, unknown>;
};

export type CreatorPostUpdateResponse = {
  ok?: boolean;
  success?: boolean;
  post?: CreatorPostEditableRecord;
  error?: string;
  details?: unknown;
};
