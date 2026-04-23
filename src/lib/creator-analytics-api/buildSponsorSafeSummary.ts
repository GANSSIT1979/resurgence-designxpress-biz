import type {
  CreatorAnalyticsApiResponse,
  SponsorSafeAnalyticsSummary,
} from '@/lib/creator-analytics-api/types';

function buildPostingCadenceLabel(postCount: number, range: '7d' | '30d') {
  const days = range === '30d' ? 30 : 7;
  const perWeek = days > 0 ? (postCount / days) * 7 : 0;

  if (perWeek >= 7) return 'High posting cadence';
  if (perWeek >= 3) return 'Consistent weekly posting cadence';
  if (perWeek >= 1) return 'Light but active posting cadence';
  return 'Limited recent posting cadence';
}

function buildWatchEfficiencyLabel(
  avgWatchTimeSeconds: number,
  completionRate: number,
) {
  if (avgWatchTimeSeconds >= 18 && completionRate >= 22) return 'Strong watch retention';
  if (avgWatchTimeSeconds >= 14 && completionRate >= 16) return 'Healthy watch retention';
  return 'Developing watch retention';
}

export function buildSponsorSafeSummary(
  payload: CreatorAnalyticsApiResponse,
): SponsorSafeAnalyticsSummary {
  const strongestPost = [...payload.topPosts].sort((left, right) => {
    if (right.viewCount !== left.viewCount) return right.viewCount - left.viewCount;
    return right.completionRate - left.completionRate;
  })[0];

  return {
    creatorId: payload.creatorId,
    range: payload.range,
    generatedAt: payload.generatedAt,
    dataMode: payload.dataMode,
    notice: payload.notice ?? null,
    headline: {
      totalViews: payload.totals.viewCount,
      totalWatchTimeSeconds: payload.totals.watchTimeSeconds,
      completionRate: payload.totals.completionRate,
      publishedPostCount: payload.totals.publishedPostCount,
    },
    highlights: {
      strongestPost: strongestPost
        ? {
            id: strongestPost.id,
            title: strongestPost.title,
            slug: strongestPost.slug,
            thumbnailUrl: strongestPost.thumbnailUrl,
            viewCount: strongestPost.viewCount,
            completionRate: strongestPost.completionRate,
            shareCount: strongestPost.shareCount,
          }
        : undefined,
      postingCadenceLabel: buildPostingCadenceLabel(
        payload.totals.publishedPostCount,
        payload.range,
      ),
      watchEfficiencyLabel: buildWatchEfficiencyLabel(
        payload.totals.avgWatchTimeSeconds,
        payload.totals.completionRate,
      ),
    },
    topPosts: payload.topPosts.slice(0, 5).map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      thumbnailUrl: row.thumbnailUrl,
      publishedAt: row.publishedAt,
      viewCount: row.viewCount,
      completionRate: row.completionRate,
      shareCount: row.shareCount,
    })),
  };
}
