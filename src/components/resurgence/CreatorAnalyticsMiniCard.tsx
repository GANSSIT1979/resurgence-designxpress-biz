import type { AnalyticsSnapshot } from '@/lib/feed-analytics/types';

function formatSeconds(value?: number) {
  const seconds = Math.max(0, Math.round(value || 0));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

export default function CreatorAnalyticsMiniCard({
  analytics,
  className = '',
}: {
  analytics: Partial<AnalyticsSnapshot>;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/40 p-3 text-white backdrop-blur ${className}`}>
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-white/50">Creator analytics</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-white/50">Views</div>
          <div className="text-lg font-semibold">{analytics.viewCount ?? 0}</div>
        </div>
        <div>
          <div className="text-white/50">Unique</div>
          <div className="text-lg font-semibold">{analytics.uniqueViewCount ?? 0}</div>
        </div>
        <div>
          <div className="text-white/50">Watch time</div>
          <div className="text-lg font-semibold">{formatSeconds(analytics.watchTimeSeconds)}</div>
        </div>
        <div>
          <div className="text-white/50">Avg watch</div>
          <div className="text-lg font-semibold">{formatSeconds(analytics.averageWatchTimeSeconds)}</div>
        </div>
      </div>
    </div>
  );
}
