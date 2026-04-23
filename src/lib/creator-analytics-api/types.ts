import type {
  AnalyticsRangeKey,
  CreatorAnalyticsDataMode,
} from '@/lib/creator-analytics/types';
import type { AppRole } from '@/lib/resurgence';

export type CreatorAnalyticsActorRole = AppRole | string;

export type CreatorAnalyticsActor = {
  userId: string;
  role: CreatorAnalyticsActorRole;
  email?: string;
  displayName?: string;
  creatorProfileId?: string | null;
  sponsorProfileId?: string | null;
  partnerProfileId?: string | null;
};

export type DailyAnalyticsRow = {
  date: string;
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
};

export type PostAnalyticsRow = {
  id: string;
  title: string;
  caption?: string | null;
  slug?: string | null;
  thumbnailUrl?: string | null;
  cloudflareVideoId?: string | null;
  publishedAt?: string | null;
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
};

export type CreatorAnalyticsTotals = {
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
  publishedPostCount: number;
};

export type CreatorAnalyticsApiResponse = {
  creatorId: string;
  range: AnalyticsRangeKey;
  generatedAt: string;
  dataMode: CreatorAnalyticsDataMode;
  notice?: string | null;
  totals: CreatorAnalyticsTotals;
  series: DailyAnalyticsRow[];
  topPosts: PostAnalyticsRow[];
};

export type CreatorAnalyticsExportPayload = {
  meta: {
    creatorId: string;
    range: AnalyticsRangeKey;
    generatedAt: string;
    dataMode: CreatorAnalyticsDataMode;
    notice?: string | null;
    rowCount: {
      daily: number;
      posts: number;
    };
  };
  summary: CreatorAnalyticsTotals;
  dailyRows: Array<DailyAnalyticsRow & { dateLabel: string }>;
  postRows: Array<PostAnalyticsRow & { publishedDateLabel?: string | null }>;
};

export type SponsorSafeAnalyticsSummary = {
  creatorId: string;
  range: AnalyticsRangeKey;
  generatedAt: string;
  dataMode: CreatorAnalyticsDataMode;
  notice?: string | null;
  headline: {
    totalViews: number;
    totalWatchTimeSeconds: number;
    completionRate: number;
    publishedPostCount: number;
  };
  highlights: {
    strongestPost?: {
      id: string;
      title: string;
      slug?: string | null;
      thumbnailUrl?: string | null;
      viewCount: number;
      completionRate: number;
      shareCount: number;
    };
    postingCadenceLabel: string;
    watchEfficiencyLabel: string;
  };
  topPosts: Array<{
    id: string;
    title: string;
    slug?: string | null;
    thumbnailUrl?: string | null;
    publishedAt?: string | null;
    viewCount: number;
    completionRate: number;
    shareCount: number;
  }>;
};
