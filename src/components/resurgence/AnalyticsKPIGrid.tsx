import { formatCompactNumber, formatDelta, formatPercent, formatSeconds } from '@/lib/creator-analytics/format';
import type { CreatorAnalyticsSnapshot } from '@/lib/creator-analytics/types';

function formatKPI(label: string, value: number) {
  if (label === 'Watch time' || label === 'Average watch') return formatSeconds(value);
  if (label === 'Completion rate') return formatPercent(value);
  return formatCompactNumber(value);
}

export default function AnalyticsKPIGrid({
  snapshot,
}: {
  snapshot: CreatorAnalyticsSnapshot;
}) {
  const cards = [
    snapshot.kpis.totalViews,
    snapshot.kpis.uniqueViews,
    snapshot.kpis.watchTimeSeconds,
    snapshot.kpis.avgWatchTimeSeconds,
    snapshot.kpis.completedViews,
    snapshot.kpis.completionRate,
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[28px] border border-white/10 bg-slate-950/88 p-5 text-white shadow-2xl shadow-black/20"
        >
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">{card.label}</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {formatKPI(card.label, card.value)}
          </div>
          <div className="mt-2 text-sm text-emerald-300">{formatDelta(card.deltaPct)}</div>
          <div className="mt-1 text-sm text-white/55">{card.helper}</div>
        </article>
      ))}
    </div>
  );
}
