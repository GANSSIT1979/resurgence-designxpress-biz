import { prisma } from '@/lib/prisma';
import { getCreatorAnalyticsDashboard } from '@/lib/creator-analytics/getCreatorAnalyticsDashboard';
import type {
  AnalyticsRangeKey,
  DailySeriesPoint,
  TopPostRow,
} from '@/lib/creator-analytics/types';
import { isPrismaSchemaDriftError } from '@/lib/prisma-schema-health';
import type {
  CreatorAnalyticsApiResponse,
  DailyAnalyticsRow,
  PostAnalyticsRow,
} from '@/lib/creator-analytics-api/types';

function sumSeries(rows: DailyAnalyticsRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.viewCount += row.viewCount;
      acc.uniqueViewCount += row.uniqueViewCount;
      acc.watchTimeSeconds += row.watchTimeSeconds;
      acc.completedViewCount += row.completedViewCount;
      acc.likeCount += row.likeCount;
      acc.commentCount += row.commentCount;
      acc.shareCount += row.shareCount;
      acc.saveCount += row.saveCount;
      return acc;
    },
    {
      viewCount: 0,
      uniqueViewCount: 0,
      watchTimeSeconds: 0,
      completedViewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      saveCount: 0,
    },
  );
}

function mapSeriesRow(row: DailySeriesPoint): DailyAnalyticsRow {
  return {
    date: row.date,
    viewCount: row.views,
    uniqueViewCount: row.uniqueViews,
    watchTimeSeconds: row.watchTimeSeconds,
    completedViewCount: row.completedViews,
    avgWatchTimeSeconds: row.avgWatchTimeSeconds,
    completionRate: row.completionRate,
    likeCount: row.likes,
    commentCount: row.comments,
    shareCount: row.shares,
    saveCount: row.saves,
  };
}

function mapTopPost(row: TopPostRow): PostAnalyticsRow {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption ?? null,
    slug: row.slug ?? null,
    thumbnailUrl: row.thumbnailUrl ?? null,
    cloudflareVideoId: row.cloudflareVideoId ?? null,
    publishedAt: row.publishedAt ?? null,
    viewCount: row.metrics.views,
    uniqueViewCount: row.metrics.uniqueViews,
    watchTimeSeconds: row.metrics.watchTimeSeconds,
    avgWatchTimeSeconds: row.metrics.avgWatchTimeSeconds,
    completedViewCount: row.metrics.completedViews,
    completionRate: row.metrics.completionRate,
    likeCount: row.metrics.likes,
    commentCount: row.metrics.comments,
    shareCount: row.metrics.shares,
    saveCount: row.metrics.saves,
  };
}

async function getPublishedPostCount(creatorId: string) {
  try {
    return await prisma.contentPost.count({
      where: {
        creatorProfileId: creatorId,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
    });
  } catch (error) {
    if (isPrismaSchemaDriftError(error)) return null;
    throw error;
  }
}

export async function getCreatorAnalyticsApi(
  creatorId: string,
  range: AnalyticsRangeKey,
): Promise<CreatorAnalyticsApiResponse> {
  const snapshot = await getCreatorAnalyticsDashboard(creatorId, range);
  const series = snapshot.series.map(mapSeriesRow);
  const topPosts = snapshot.topPosts.map(mapTopPost);
  const totals = sumSeries(series);
  const publishedPostCount = (await getPublishedPostCount(creatorId)) ?? topPosts.length;

  return {
    creatorId,
    range,
    generatedAt: snapshot.generatedAt,
    dataMode: snapshot.dataMode,
    notice: snapshot.notice ?? null,
    totals: {
      viewCount: totals.viewCount,
      uniqueViewCount: totals.uniqueViewCount,
      watchTimeSeconds: totals.watchTimeSeconds,
      completedViewCount: totals.completedViewCount,
      avgWatchTimeSeconds: snapshot.kpis.avgWatchTimeSeconds.value,
      completionRate: snapshot.kpis.completionRate.value,
      likeCount: totals.likeCount,
      commentCount: totals.commentCount,
      shareCount: totals.shareCount,
      saveCount: totals.saveCount,
      publishedPostCount,
    },
    series,
    topPosts,
  };
}
