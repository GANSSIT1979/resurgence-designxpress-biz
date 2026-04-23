export type AnalyticsRangeKey = '7d' | '30d';

export type CreatorAnalyticsDataMode = 'live' | 'demo' | 'empty';

export type DailySeriesPoint = {
  date: string;
  views: number;
  uniqueViews: number;
  watchTimeSeconds: number;
  completedViews: number;
  avgWatchTimeSeconds: number;
  completionRate: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
};

export type TopPostRow = {
  id: string;
  title: string;
  caption?: string | null;
  slug?: string | null;
  thumbnailUrl?: string | null;
  cloudflareVideoId?: string | null;
  publishedAt?: string | null;
  metrics: {
    views: number;
    uniqueViews: number;
    watchTimeSeconds: number;
    avgWatchTimeSeconds: number;
    completedViews: number;
    completionRate: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
};

export type KPIValue = {
  label: string;
  value: number;
  deltaPct?: number;
  helper?: string;
};

export type CreatorAnalyticsSnapshot = {
  creatorId: string;
  range: AnalyticsRangeKey;
  generatedAt: string;
  dataMode: CreatorAnalyticsDataMode;
  notice?: string | null;
  kpis: {
    totalViews: KPIValue;
    uniqueViews: KPIValue;
    watchTimeSeconds: KPIValue;
    avgWatchTimeSeconds: KPIValue;
    completedViews: KPIValue;
    completionRate: KPIValue;
  };
  series: DailySeriesPoint[];
  topPosts: TopPostRow[];
};
