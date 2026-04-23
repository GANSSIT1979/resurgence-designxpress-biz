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
  avgWatchTimeSeconds?: unknown;
  completionRate?: unknown;
  viewerSessionIds?: unknown;
  completedViewerSessionIds?: unknown;
  firstViewedAt?: unknown;
  lastViewedAt?: unknown;
};

export type AnalyticsCounterState = {
  viewCount: number;
  uniqueViewCount: number;
  watchTimeSeconds: number;
  completedViewCount: number;
  averageWatchTimeSeconds: number;
  completionRate: number;
  firstViewedAt?: string | null;
  lastViewedAt?: string | null;
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

function asDateString(value: unknown) {
  if (typeof value === 'string') return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  return null;
}

export function getAnalyticsMeta(metadata: unknown) {
  const root = asRecord(metadata);
  return asRecord(root.analytics) as AnalyticsMetaRecord;
}

export function extractAnalyticsCounterState(source: {
  viewCount?: unknown;
  uniqueViewCount?: unknown;
  watchTimeSeconds?: unknown;
  completedViewCount?: unknown;
  averageWatchTimeSeconds?: unknown;
  avgWatchTimeSeconds?: unknown;
  completionRate?: unknown;
  firstViewedAt?: unknown;
  lastViewedAt?: unknown;
  likeCount?: unknown;
  saveCount?: unknown;
  shareCount?: unknown;
  commentCount?: unknown;
  metadataJson?: unknown;
  metadata?: unknown;
}): AnalyticsCounterState {
  const analytics = getAnalyticsMeta(source.metadataJson ?? source.metadata);
  const viewCount = asNumber(source.viewCount ?? analytics.viewCount);
  const uniqueViewCount = asNumber(source.uniqueViewCount ?? analytics.uniqueViewCount);
  const watchTimeSeconds = asNumber(source.watchTimeSeconds ?? analytics.watchTimeSeconds);
  const completedViewCount = asNumber(source.completedViewCount ?? analytics.completedViewCount);
  const averageWatchTimeSeconds = round(
    asNumber(source.averageWatchTimeSeconds ?? source.avgWatchTimeSeconds ?? analytics.avgWatchTimeSeconds) ||
      (viewCount > 0 ? watchTimeSeconds / viewCount : 0),
  );
  const completionRate = round(
    asNumber(source.completionRate ?? analytics.completionRate) ||
      (viewCount > 0 ? (completedViewCount / viewCount) * 100 : 0),
  );

  return {
    viewCount,
    uniqueViewCount,
    watchTimeSeconds,
    completedViewCount,
    averageWatchTimeSeconds,
    completionRate,
    firstViewedAt: asDateString(source.firstViewedAt ?? analytics.firstViewedAt),
    lastViewedAt: asDateString(source.lastViewedAt ?? analytics.lastViewedAt),
  };
}

export function extractAnalyticsSnapshot(source: {
  viewCount?: unknown;
  uniqueViewCount?: unknown;
  watchTimeSeconds?: unknown;
  completedViewCount?: unknown;
  averageWatchTimeSeconds?: unknown;
  avgWatchTimeSeconds?: unknown;
  completionRate?: unknown;
  firstViewedAt?: unknown;
  lastViewedAt?: unknown;
  likeCount?: unknown;
  saveCount?: unknown;
  shareCount?: unknown;
  commentCount?: unknown;
  metadataJson?: unknown;
  metadata?: unknown;
}): AnalyticsSnapshot {
  const counters = extractAnalyticsCounterState(source);

  return {
    viewCount: counters.viewCount,
    uniqueViewCount: counters.uniqueViewCount,
    watchTimeSeconds: counters.watchTimeSeconds,
    averageWatchTimeSeconds: counters.averageWatchTimeSeconds,
    completionRate: counters.completionRate,
    shareCount: asNumber(source.shareCount),
    likeCount: asNumber(source.likeCount),
    saveCount: asNumber(source.saveCount),
    commentCount: asNumber(source.commentCount),
    lastViewedAt: counters.lastViewedAt ?? null,
  };
}
