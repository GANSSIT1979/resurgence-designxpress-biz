import {
  deriveCloudflareStreamThumbnailUrl,
  getCloudflareStreamVideoId,
} from '@/lib/cloudflare-stream';
import { prisma } from '@/lib/prisma';
import { isPrismaSchemaDriftError } from '@/lib/prisma-schema-health';
import type {
  AnalyticsRangeKey,
  CreatorAnalyticsDataMode,
  CreatorAnalyticsSnapshot,
  DailySeriesPoint,
  TopPostRow,
} from '@/lib/creator-analytics/types';

const RANGE_DAYS: Record<AnalyticsRangeKey, number> = {
  '7d': 7,
  '30d': 30,
};

type Totals = {
  views: number;
  uniqueViews: number;
  watchTimeSeconds: number;
  completedViews: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function buildDateKey(value: Date | string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function emptyTotals(): Totals {
  return {
    views: 0,
    uniqueViews: 0,
    watchTimeSeconds: 0,
    completedViews: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
  };
}

function accumulateSeries(points: DailySeriesPoint[]) {
  return points.reduce<Totals>((acc, point) => {
    acc.views += point.views;
    acc.uniqueViews += point.uniqueViews;
    acc.watchTimeSeconds += point.watchTimeSeconds;
    acc.completedViews += point.completedViews;
    acc.likes += point.likes;
    acc.comments += point.comments;
    acc.shares += point.shares;
    acc.saves += point.saves;
    return acc;
  }, emptyTotals());
}

function buildDelta(current: number, previous: number) {
  if (!previous || previous <= 0) return undefined;
  return round(((current - previous) / previous) * 100);
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeSeriesRow(row: {
  date: Date;
  viewCount: number;
  uniqueViewCount: number;
  watchTimeSeconds: number;
  completedViewCount: number;
  avgWatchTimeSeconds: number;
  completionRate: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
}): DailySeriesPoint {
  return {
    date: row.date.toISOString(),
    views: row.viewCount || 0,
    uniqueViews: row.uniqueViewCount || 0,
    watchTimeSeconds: row.watchTimeSeconds || 0,
    completedViews: row.completedViewCount || 0,
    avgWatchTimeSeconds: row.avgWatchTimeSeconds || 0,
    completionRate: row.completionRate || 0,
    likes: row.likeCount || 0,
    comments: row.commentCount || 0,
    shares: row.shareCount || 0,
    saves: row.saveCount || 0,
  };
}

function fillCurrentSeries(days: number, start: Date, rows: DailySeriesPoint[]) {
  const rowMap = new Map(rows.map((row) => [buildDateKey(row.date), row]));

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    const key = buildDateKey(date);
    return (
      rowMap.get(key) || {
        date: date.toISOString(),
        views: 0,
        uniqueViews: 0,
        watchTimeSeconds: 0,
        completedViews: 0,
        avgWatchTimeSeconds: 0,
        completionRate: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
      }
    );
  });
}

function buildKpis({
  current,
  previous,
  range,
}: {
  current: Totals;
  previous: Totals;
  range: AnalyticsRangeKey;
}) {
  const currentAverageWatch = current.views > 0 ? round(current.watchTimeSeconds / current.views) : 0;
  const previousAverageWatch = previous.views > 0 ? round(previous.watchTimeSeconds / previous.views) : 0;
  const currentCompletionRate =
    current.views > 0 ? round((current.completedViews / current.views) * 100) : 0;
  const previousCompletionRate =
    previous.views > 0 ? round((previous.completedViews / previous.views) * 100) : 0;
  const windowLabel = range === '30d' ? '30-day window' : '7-day window';

  return {
    totalViews: {
      label: 'Total views',
      value: current.views,
      deltaPct: buildDelta(current.views, previous.views),
      helper: `${windowLabel} reach`,
    },
    uniqueViews: {
      label: 'Unique viewers',
      value: current.uniqueViews,
      deltaPct: buildDelta(current.uniqueViews, previous.uniqueViews),
      helper: 'Deduped session reach',
    },
    watchTimeSeconds: {
      label: 'Watch time',
      value: current.watchTimeSeconds,
      deltaPct: buildDelta(current.watchTimeSeconds, previous.watchTimeSeconds),
      helper: 'Total watched seconds',
    },
    avgWatchTimeSeconds: {
      label: 'Average watch',
      value: currentAverageWatch,
      deltaPct: buildDelta(currentAverageWatch, previousAverageWatch),
      helper: 'Per-view average',
    },
    completedViews: {
      label: 'Completed views',
      value: current.completedViews,
      deltaPct: buildDelta(current.completedViews, previous.completedViews),
      helper: 'Reached completion threshold',
    },
    completionRate: {
      label: 'Completion rate',
      value: currentCompletionRate,
      deltaPct: buildDelta(currentCompletionRate, previousCompletionRate),
      helper: 'Completed views vs total views',
    },
  };
}

function mapTopPosts(rows: Array<{
  id: string;
  title: string | null;
  caption: string;
  slug: string | null;
  publishedAt: Date | null;
  viewCount: number;
  uniqueViewCount: number;
  watchTimeSeconds: number;
  avgWatchTimeSeconds: number;
  completedViewCount: number;
  completionRate: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  mediaAssets: Array<{
    url: string;
    thumbnailUrl: string | null;
    storageProvider: string | null;
    storageKey: string | null;
    metadataJson: unknown;
  }>;
}>): TopPostRow[] {
  return rows.map((row) => {
    const primaryMedia = row.mediaAssets[0];
    const mediaMetadata = asRecord(primaryMedia?.metadataJson);
    const cloudflareVideoId = primaryMedia
      ? getCloudflareStreamVideoId({
          url: primaryMedia.url,
          storageProvider: primaryMedia.storageProvider,
          storageKey: primaryMedia.storageKey,
          metadata: mediaMetadata,
        }) || null
      : null;

    return {
      id: row.id,
      title: row.title?.trim() || row.caption.trim().slice(0, 96) || 'Untitled post',
      caption: row.caption || null,
      slug: row.slug,
      thumbnailUrl:
        primaryMedia?.thumbnailUrl ||
        deriveCloudflareStreamThumbnailUrl(primaryMedia?.url) ||
        null,
      cloudflareVideoId,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      metrics: {
        views: row.viewCount || 0,
        uniqueViews: row.uniqueViewCount || 0,
        watchTimeSeconds: row.watchTimeSeconds || 0,
        avgWatchTimeSeconds: row.avgWatchTimeSeconds || 0,
        completedViews: row.completedViewCount || 0,
        completionRate: row.completionRate || 0,
        likes: row.likeCount || 0,
        comments: row.commentCount || 0,
        shares: row.shareCount || 0,
        saves: row.saveCount || 0,
      },
    };
  });
}

function buildSnapshot({
  creatorId,
  range,
  dataMode,
  notice = null,
  series,
  topPosts,
}: {
  creatorId: string;
  range: AnalyticsRangeKey;
  dataMode: CreatorAnalyticsDataMode;
  notice?: string | null;
  series: DailySeriesPoint[];
  topPosts: TopPostRow[];
}): CreatorAnalyticsSnapshot {
  const days = RANGE_DAYS[range];
  const currentSeries = series.slice(-days);
  const previousSeries = series.slice(0, Math.max(0, series.length - days));
  const currentTotals = accumulateSeries(currentSeries);
  const previousTotals = accumulateSeries(previousSeries);

  return {
    creatorId,
    range,
    generatedAt: new Date().toISOString(),
    dataMode,
    notice,
    kpis: buildKpis({
      current: currentTotals,
      previous: previousTotals,
      range,
    }),
    series: currentSeries,
    topPosts,
  };
}

function buildDemoSeries(range: AnalyticsRangeKey): DailySeriesPoint[] {
  const days = RANGE_DAYS[range];
  const today = startOfDay(new Date());

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, -(days - index - 1));
    const views = Math.round(1280 + index * 210 + (index % 3) * 155);
    const uniqueViews = Math.round(views * 0.71);
    const watchTimeSeconds = Math.round(views * (17 + (index % 4) * 2.8));
    const completedViews = Math.round(views * (0.2 + (index % 5) * 0.025));
    const avgWatchTimeSeconds = views ? round(watchTimeSeconds / views) : 0;
    const completionRate = views ? round((completedViews / views) * 100) : 0;

    return {
      date: date.toISOString(),
      views,
      uniqueViews,
      watchTimeSeconds,
      completedViews,
      avgWatchTimeSeconds,
      completionRate,
      likes: Math.round(views * 0.082),
      comments: Math.round(views * 0.018),
      shares: Math.round(views * 0.011),
      saves: Math.round(views * 0.014),
    };
  });
}

function buildDemoTopPosts(range: AnalyticsRangeKey): TopPostRow[] {
  const multiplier = range === '30d' ? 1.45 : 1;

  return [
    {
      id: 'demo-post-001',
      title: 'Championship recap',
      caption: 'Behind the scenes from the finals with a tighter hook and faster merch CTA.',
      slug: 'championship-recap',
      thumbnailUrl: null,
      cloudflareVideoId: 'demo-video-001',
      publishedAt: new Date().toISOString(),
      metrics: {
        views: Math.round(28400 * multiplier),
        uniqueViews: Math.round(20100 * multiplier),
        watchTimeSeconds: Math.round(518000 * multiplier),
        avgWatchTimeSeconds: 18.2,
        completedViews: Math.round(6400 * multiplier),
        completionRate: 22.5,
        likes: Math.round(2400 * multiplier),
        comments: Math.round(410 * multiplier),
        shares: Math.round(310 * multiplier),
        saves: Math.round(520 * multiplier),
      },
    },
    {
      id: 'demo-post-002',
      title: 'Training tips drop',
      caption: 'Fast form cues for your next session, optimized for repeat views.',
      slug: 'training-tips-drop',
      thumbnailUrl: null,
      cloudflareVideoId: 'demo-video-002',
      publishedAt: new Date().toISOString(),
      metrics: {
        views: Math.round(21700 * multiplier),
        uniqueViews: Math.round(16100 * multiplier),
        watchTimeSeconds: Math.round(401000 * multiplier),
        avgWatchTimeSeconds: 18.5,
        completedViews: Math.round(5300 * multiplier),
        completionRate: 24.4,
        likes: Math.round(1900 * multiplier),
        comments: Math.round(370 * multiplier),
        shares: Math.round(280 * multiplier),
        saves: Math.round(470 * multiplier),
      },
    },
    {
      id: 'demo-post-003',
      title: 'New merch preview',
      caption: 'Tagged merch performance highlight with stronger retention in the opening seconds.',
      slug: 'new-merch-preview',
      thumbnailUrl: null,
      cloudflareVideoId: 'demo-video-003',
      publishedAt: new Date().toISOString(),
      metrics: {
        views: Math.round(16800 * multiplier),
        uniqueViews: Math.round(12400 * multiplier),
        watchTimeSeconds: Math.round(279000 * multiplier),
        avgWatchTimeSeconds: 16.6,
        completedViews: Math.round(3120 * multiplier),
        completionRate: 18.6,
        likes: Math.round(1520 * multiplier),
        comments: Math.round(260 * multiplier),
        shares: Math.round(210 * multiplier),
        saves: Math.round(390 * multiplier),
      },
    },
  ];
}

function buildDemoSnapshot(creatorId: string, range: AnalyticsRangeKey) {
  return buildSnapshot({
    creatorId,
    range,
    dataMode: 'demo',
    notice:
      'Showing preview analytics because this environment is still waiting on the additive creator analytics migration or backfill.',
    series: buildDemoSeries(range),
    topPosts: buildDemoTopPosts(range),
  });
}

function buildEmptySnapshot(
  creatorId: string,
  range: AnalyticsRangeKey,
  topPosts: TopPostRow[] = [],
  notice: string | null = null,
) {
  return buildSnapshot({
    creatorId,
    range,
    dataMode: 'empty',
    notice,
    series: [],
    topPosts,
  });
}

async function loadFromPrisma(creatorId: string, range: AnalyticsRangeKey) {
  const days = RANGE_DAYS[range];
  const currentStart = startOfDay(addDays(new Date(), -(days - 1)));
  const previousStart = addDays(currentStart, -days);
  const tomorrowStart = addDays(startOfDay(new Date()), 1);

  const [seriesRows, topPostRows] = await Promise.all([
    prisma.creatorAnalyticsDay.findMany({
      where: {
        creatorProfileId: creatorId,
        date: {
          gte: previousStart,
          lt: tomorrowStart,
        },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        viewCount: true,
        uniqueViewCount: true,
        watchTimeSeconds: true,
        completedViewCount: true,
        avgWatchTimeSeconds: true,
        completionRate: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        saveCount: true,
      },
    }),
    prisma.contentPost.findMany({
      where: {
        creatorProfileId: creatorId,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
      orderBy: [{ viewCount: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: {
        id: true,
        title: true,
        caption: true,
        slug: true,
        publishedAt: true,
        viewCount: true,
        uniqueViewCount: true,
        watchTimeSeconds: true,
        avgWatchTimeSeconds: true,
        completedViewCount: true,
        completionRate: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        saveCount: true,
        mediaAssets: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          take: 1,
          select: {
            url: true,
            thumbnailUrl: true,
            storageProvider: true,
            storageKey: true,
            metadataJson: true,
          },
        },
      },
    }),
  ]);

  const normalizedRows = seriesRows.map(normalizeSeriesRow);
  const currentRows = normalizedRows.filter((row) => buildDateKey(row.date) >= buildDateKey(currentStart));
  const previousRows = normalizedRows.filter((row) => buildDateKey(row.date) < buildDateKey(currentStart));
  const topPosts = mapTopPosts(topPostRows);
  const filledPreviousRows = fillCurrentSeries(days, previousStart, previousRows);

  if (!currentRows.length) {
    return buildEmptySnapshot(
      creatorId,
      range,
      topPosts,
      topPosts.length
        ? 'Daily creator rollups are not populated yet, so the leaderboard below is using current live post counters only.'
        : null,
    );
  }

  return buildSnapshot({
    creatorId,
    range,
    dataMode: 'live',
    series: [...filledPreviousRows, ...fillCurrentSeries(days, currentStart, currentRows)],
    topPosts,
  });
}

export async function getCreatorAnalyticsDashboard(
  creatorId: string,
  range: AnalyticsRangeKey,
): Promise<CreatorAnalyticsSnapshot> {
  try {
    return await loadFromPrisma(creatorId, range);
  } catch (error) {
    if (!isPrismaSchemaDriftError(error)) {
      throw error;
    }

    console.error(
      '[creator-analytics] Falling back to demo analytics after a schema drift.',
      error,
    );
    return buildDemoSnapshot(creatorId, range);
  }
}
