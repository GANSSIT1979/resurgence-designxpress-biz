import { EarningsCards } from '@/components/earnings/EarningsCards'
import { EarningsCharts } from '@/components/earnings/EarningsCharts'
import { PayoutRequestForm } from '@/components/earnings/PayoutRequestForm'

async function getEarnings(creatorProfileId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/creator/earnings?creatorProfileId=${creatorProfileId}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load earnings')
  return res.json()
}

export default async function CreatorEarningsPage({ searchParams }: { searchParams: { creatorProfileId?: string } }) {
  const creatorProfileId = searchParams.creatorProfileId || ''

  if (!creatorProfileId) {
    return <main className="p-6">Missing creatorProfileId.</main>
  }

  const data = await getEarnings(creatorProfileId)

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Creator Earnings</h1>
        <p className="text-gray-600">Track revenue, CTR, conversions, commissions, and withdrawals.</p>
      </div>

      <EarningsCards summary={data.summary} availableCents={data.availableCents} />
      <EarningsCharts summary={data.summary} />
      <PayoutRequestForm creatorProfileId={creatorProfileId} availableCents={data.availableCents} />
    </main>
  )
}
