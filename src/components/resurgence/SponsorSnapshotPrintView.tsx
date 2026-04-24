import type { SponsorSafeAnalyticsSummary } from '@/lib/sponsor-analytics-share/types'

type Props = {
  summary: SponsorSafeAnalyticsSummary
}

export default function SponsorSnapshotPrintView({ summary }: Props) {
  return (
    <div className="mx-auto max-w-4xl bg-white p-10 text-black print:p-0">
      <header className="border-b pb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Printable Snapshot</p>
        <h1 className="mt-2 text-3xl font-bold">{summary.creator.displayName}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Reporting window: {summary.period.startDate} to {summary.period.endDate}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 py-8 md:grid-cols-3">
        <Metric label="Views" value={summary.headline.totalViews} />
        <Metric label="Unique Views" value={summary.headline.uniqueViews} />
        <Metric label="Completed Views" value={summary.headline.completedViews} />
        <Metric label="Completion Rate" value={`${summary.headline.completionRate.toFixed(1)}%`} />
        <Metric label="Watch Time" value={`${summary.headline.watchTimeSeconds}s`} />
        <Metric label="Average Watch" value={`${summary.headline.avgWatchTimeSeconds.toFixed(1)}s`} />
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{typeof value === 'number' ? new Intl.NumberFormat().format(value) : value}</p>
    </div>
  )
}
