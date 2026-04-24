import type { PartnerSafeSnapshot } from '@/lib/sponsor-analytics-share/types'

type Props = {
  snapshot: PartnerSafeSnapshot
}

export default function PartnerSafeAnalyticsSnapshot({ snapshot }: Props) {
  return (
    <section className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <img
          src={snapshot.creatorAvatarUrl || 'https://placehold.co/80x80/png'}
          alt={snapshot.creatorDisplayName}
          className="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">Partner Snapshot</p>
          <h2 className="text-2xl font-semibold text-zinc-900">{snapshot.creatorDisplayName}</h2>
          <p className="text-sm text-zinc-500">{snapshot.periodLabel} summary</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Views" value={snapshot.stats.totalViews} />
        <Stat label="Unique" value={snapshot.stats.uniqueViews} />
        <Stat label="Completion" value={`${snapshot.stats.completionRate.toFixed(1)}%`} />
        <Stat label="Avg Watch" value={`${snapshot.stats.avgWatchTimeSeconds.toFixed(1)}s`} />
      </div>

      {snapshot.featuredPost ? (
        <div className="mt-6 rounded-2xl border border-zinc-200 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Featured Post</p>
          <div className="mt-3 flex items-start gap-4">
            <img
              src={snapshot.featuredPost.thumbnailUrl || 'https://placehold.co/320x180/png'}
              alt={snapshot.featuredPost.title}
              className="h-24 w-40 rounded-2xl object-cover"
            />
            <div>
              <p className="text-lg font-medium text-zinc-900">{snapshot.featuredPost.title}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {snapshot.featuredPost.creatorLink ? <a href={snapshot.featuredPost.creatorLink} className="rounded-full bg-zinc-900 px-3 py-1 text-white">Creator Profile</a> : null}
                {snapshot.featuredPost.productLink ? <a href={snapshot.featuredPost.productLink} className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-900">Tagged Product</a> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-zinc-900">{typeof value === 'number' ? new Intl.NumberFormat().format(value) : value}</p>
    </div>
  )
}
