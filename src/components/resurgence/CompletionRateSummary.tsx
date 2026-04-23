import { formatCompactNumber, formatPercent, formatSeconds } from '@/lib/creator-analytics/format';
import type { CreatorAnalyticsSnapshot } from '@/lib/creator-analytics/types';

export default function CompletionRateSummary({
  snapshot,
}: {
  snapshot: CreatorAnalyticsSnapshot;
}) {
  const completionRate = snapshot.kpis.completionRate.value;
  const completedViews = snapshot.kpis.completedViews.value;
  const averageWatch = snapshot.kpis.avgWatchTimeSeconds.value;
  const sourceCopy =
    snapshot.dataMode === 'demo'
      ? 'Preview values while analytics tables finish rolling out.'
      : 'Completion and watch signals from creator daily rollups.';

  return (
    <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-amber-300/12 via-slate-950/88 to-sky-400/10 p-5 text-white shadow-2xl shadow-black/20">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Retention summary</h3>
        <p className="text-sm text-white/55">{sourceCopy}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-white/10 bg-black/25 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Completion rate</div>
          <div className="mt-3 text-3xl font-semibold">{formatPercent(completionRate)}</div>
          <div className="mt-2 text-sm text-white/55">
            Share of views that reached your completion threshold.
          </div>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-black/25 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Completed views</div>
          <div className="mt-3 text-3xl font-semibold">{formatCompactNumber(completedViews)}</div>
          <div className="mt-2 text-sm text-white/55">
            Best used with a strong first three seconds and a clean CTA handoff.
          </div>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-black/25 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Average watch</div>
          <div className="mt-3 text-3xl font-semibold">{formatSeconds(averageWatch)}</div>
          <div className="mt-2 text-sm text-white/55">
            Useful for comparing short highlights against longer story-led content.
          </div>
        </article>
      </div>
    </section>
  );
}
