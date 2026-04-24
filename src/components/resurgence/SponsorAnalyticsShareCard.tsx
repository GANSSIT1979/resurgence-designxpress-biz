import type { SponsorSafeAnalyticsSummary } from '@/lib/sponsor-analytics-share/types'

type Props = {
  summary: SponsorSafeAnalyticsSummary
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value)
}

export default function SponsorAnalyticsShareCard({ summary }: Props) {
  const stats = [
    ['Views', formatNumber(summary.headline.totalViews)],
    ['Unique', formatNumber(summary.headline.uniqueViews)],
    ['Completed', formatNumber(summary.headline.completedViews)],
    ['Completion', `${summary.headline.completionRate.toFixed(1)}%`],
  ]

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 text-white shadow-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Sponsor Summary</p>
          <h2 className="mt-2 text-2xl font-semibold">{summary.creator.displayName}</h2>
          <p className="mt-1 text-sm text-zinc-400">{summary.period.label} performance window</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
          <p className="text-xs text-zinc-400">Generated</p>
          <p className="text-sm font-medium">{new Date(summary.generatedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Top Post Highlight</p>
        {summary.topPosts[0] ? (
          <div className="mt-3 flex items-start gap-4">
            <img
              src={summary.topPosts[0].thumbnailUrl || 'https://placehold.co/320x180/png'}
              alt={summary.topPosts[0].title}
              className="h-24 w-40 rounded-2xl object-cover"
            />
            <div>
              <p className="text-lg font-medium">{summary.topPosts[0].title}</p>
              <p className="mt-2 text-sm text-zinc-400">
                {formatNumber(summary.topPosts[0].viewCount)} views • {summary.topPosts[0].completionRate.toFixed(1)}% completion
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">No top-post highlights are available yet.</p>
        )}
      </div>
    </div>
  )
}
