export type ViewerActor = {
  userId?: string | null;
  role?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export type AnalyticsSnapshot = {
  viewCount: number;
  uniqueViewCount: number;
  watchTimeSeconds: number;
  averageWatchTimeSeconds: number;
  completionRate: number;
  shareCount: number;
  likeCount: number;
  saveCount: number;
  commentCount: number;
  lastViewedAt?: string | null;
};

export type RegisterViewInput = {
  postId: string;
  viewerSessionId?: string | null;
  source?: string | null;
  surfacedAt?: string | null;
};

export type RegisterWatchTimeInput = {
  postId: string;
  secondsWatched: number;
  viewerSessionId?: string | null;
  completed?: boolean;
  source?: string | null;
};

export type AnalyticsRouteSuccess = {
  success: true;
  postId: string;
  analytics: AnalyticsSnapshot;
};

type AnalyticsMetaRecord = {
  viewCount?: unknown;
  uniqueViewCount?: unknown;
  watchTimeSeconds?: unknown;
  completedViewCount?: unknown;
  viewerSessionIds?: unknown;
  completedViewerSessionIds?: unknown;
  lastViewedAt?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asNumber(value: unknown) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function getAnalyticsMeta(metadata: unknown) {
  const root = asRecord(metadata);
  return asRecord(root.analytics) as AnalyticsMetaRecord;
}

export function extractAnalyticsSnapshot(source: {
  viewCount?: unknown;
  likeCount?: unknown;
  saveCount?: unknown;
  shareCount?: unknown;
  commentCount?: unknown;
  metadataJson?: unknown;
  metadata?: unknown;
}): AnalyticsSnapshot {
  const analytics = getAnalyticsMeta(source.metadataJson ?? source.metadata);
  const viewCount = asNumber(source.viewCount ?? analytics.viewCount);
  const uniqueViewCount = asNumber(analytics.uniqueViewCount);
  const watchTimeSeconds = asNumber(analytics.watchTimeSeconds);
  const completedViewCount = asNumber(analytics.completedViewCount);

  return {
    viewCount,
    uniqueViewCount,
    watchTimeSeconds,
    averageWatchTimeSeconds: viewCount > 0 ? round(watchTimeSeconds / viewCount) : 0,
    completionRate: viewCount > 0 ? round((completedViewCount / viewCount) * 100) : 0,
    shareCount: asNumber(source.shareCount),
    likeCount: asNumber(source.likeCount),
    saveCount: asNumber(source.saveCount),
    commentCount: asNumber(source.commentCount),
    lastViewedAt: typeof analytics.lastViewedAt === 'string' ? analytics.lastViewedAt : null,
  };
}
