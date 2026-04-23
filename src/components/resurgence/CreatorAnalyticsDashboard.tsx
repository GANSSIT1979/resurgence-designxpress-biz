'use client';

import { useState } from 'react';
import AnalyticsDateRangeTabs from '@/components/resurgence/AnalyticsDateRangeTabs';
import AnalyticsKPIGrid from '@/components/resurgence/AnalyticsKPIGrid';
import AnalyticsLineChartCard from '@/components/resurgence/AnalyticsLineChartCard';
import CompletionRateSummary from '@/components/resurgence/CompletionRateSummary';
import CreatorAnalyticsEmptyState from '@/components/resurgence/CreatorAnalyticsEmptyState';
import PostPerformanceLeaderboard from '@/components/resurgence/PostPerformanceLeaderboard';
import { formatPercent, formatSeconds } from '@/lib/creator-analytics/format';
import type {
  AnalyticsRangeKey,
  CreatorAnalyticsSnapshot,
} from '@/lib/creator-analytics/types';

export default function CreatorAnalyticsDashboard({
  snapshots,
  creatorName,
  initialRange = '7d',
}: {
  snapshots: Record<AnalyticsRangeKey, CreatorAnalyticsSnapshot>;
  creatorName?: string;
  initialRange?: AnalyticsRangeKey;
}) {
  const [range, setRange] = useState<AnalyticsRangeKey>(initialRange);
  const snapshot = snapshots[range];
  const hasSeries = Boolean(snapshot?.series?.length);
  const hasLeaderboard = Boolean(snapshot?.topPosts?.length);
  const isDemo = snapshot?.dataMode === 'demo';

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-white/45">
            Creator analytics dashboard
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {creatorName ? `${creatorName} performance, retention, and content winners` : 'Performance, retention, and content winners'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Seven-day and thirty-day creator insights driven by rollup tables and standardized post counters.
          </p>
        </div>
        <AnalyticsDateRangeTabs value={range} onChange={setRange} />
      </div>

      {snapshot.notice ? (
        <div
          className={`rounded-[28px] border p-4 text-sm shadow-2xl shadow-black/20 ${
            isDemo
              ? 'border-amber-300/20 bg-amber-300/10 text-amber-100'
              : 'border-white/10 bg-white/[0.04] text-white/75'
          }`}
        >
          {snapshot.notice}
        </div>
      ) : null}

      {hasSeries ? (
        <>
          <AnalyticsKPIGrid snapshot={snapshot} />

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsLineChartCard
              title="Views trend"
              subtitle={`Daily views for the ${range === '30d' ? 'last 30 days' : 'last 7 days'}`}
              data={snapshot.series}
              metric="views"
            />
            <AnalyticsLineChartCard
              title="Watch time trend"
              subtitle="Total watched seconds by day"
              data={snapshot.series}
              metric="watchTimeSeconds"
              valueFormatter={(value) => formatSeconds(value)}
            />
            <AnalyticsLineChartCard
              title="Completion rate"
              subtitle="Completion quality over time"
              data={snapshot.series}
              metric="completionRate"
              valueFormatter={(value) => formatPercent(value)}
            />
            <AnalyticsLineChartCard
              title="Average watch duration"
              subtitle="Average watched seconds per view"
              data={snapshot.series}
              metric="avgWatchTimeSeconds"
              valueFormatter={(value) => formatSeconds(value)}
            />
          </div>

          <CompletionRateSummary snapshot={snapshot} />
        </>
      ) : (
        <CreatorAnalyticsEmptyState hasTopPosts={hasLeaderboard} />
      )}

      {hasLeaderboard ? <PostPerformanceLeaderboard posts={snapshot.topPosts} /> : null}
    </div>
  );
}
