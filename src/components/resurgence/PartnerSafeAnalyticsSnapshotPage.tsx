import PartnerSafeAnalyticsSnapshot from '@/components/resurgence/PartnerSafeAnalyticsSnapshot'
import type { PartnerSafeSnapshot } from '@/lib/sponsor-analytics-share/types'

type Props = {
  token: string
}

async function getSnapshot(token: string): Promise<PartnerSafeSnapshot> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/sponsor/analytics/share/${token}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to load partner-safe analytics snapshot.')
  }

  const data = await res.json()
  return data.snapshot as PartnerSafeSnapshot
}

export default async function PartnerSafeAnalyticsSnapshotPage({ token }: Props) {
  const snapshot = await getSnapshot(token)

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10">
      <PartnerSafeAnalyticsSnapshot snapshot={snapshot} />
    </main>
  )
}
