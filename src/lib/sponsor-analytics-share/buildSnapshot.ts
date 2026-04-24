import type { PartnerSafeSnapshot, SponsorAnalyticsShareTokenRecord, SponsorSafeAnalyticsSummary } from './types'

export function buildPartnerSafeSnapshot(
  token: SponsorAnalyticsShareTokenRecord,
  summary: SponsorSafeAnalyticsSummary
): PartnerSafeSnapshot {
  const firstTopPost = token.includeTopPosts ? summary.topPosts[0] ?? null : null

  return {
    token: token.token,
    creatorDisplayName: summary.creator.displayName,
    creatorHandle: summary.creator.handle,
    creatorAvatarUrl: summary.creator.avatarUrl,
    periodLabel: summary.period.label,
    stats: {
      totalViews: summary.headline.totalViews,
      uniqueViews: summary.headline.uniqueViews,
      completionRate: token.includeCompletionRate ? summary.headline.completionRate : 0,
      avgWatchTimeSeconds: token.includeWatchTime ? summary.headline.avgWatchTimeSeconds : 0,
    },
    featuredPost: firstTopPost
      ? {
          title: firstTopPost.title,
          thumbnailUrl: firstTopPost.thumbnailUrl,
          creatorLink: firstTopPost.creatorLink,
          productLink: token.includeProducts ? firstTopPost.productLink : null,
        }
      : null,
    sponsorLabel: token.sponsorName ?? token.partnerName ?? null,
    generatedAt: summary.generatedAt,
  }
}
