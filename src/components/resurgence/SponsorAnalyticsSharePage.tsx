import SponsorAnalyticsShareCard from '@/components/resurgence/SponsorAnalyticsShareCard'
import SponsorSnapshotPrintView from '@/components/resurgence/SponsorSnapshotPrintView'
import type { SponsorSafeAnalyticsSummary } from '@/lib/sponsor-analytics-share/types'

type Props = {
  token: string
}

async function getSummary(token: string): Promise<SponsorSafeAnalyticsSummary> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/sponsor/analytics/share/${token}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to load sponsor analytics share summary.')
  }

  const data = await res.json()
  return data.summary as SponsorSafeAnalyticsSummary
}

export default async function SponsorAnalyticsSharePage({ token }: Props) {
  const summary = await getSummary(token)

  return (
    <main className="min-h-screen bg-black px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <SponsorAnalyticsShareCard summary={summary} />
        <SponsorSnapshotPrintView summary={summary} />
      </div>
    </main>
  )
}
