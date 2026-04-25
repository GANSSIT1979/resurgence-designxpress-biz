import { NextResponse } from 'next/server'
import { getCreatorEarningsSummary, getCreatorAvailableBalance } from '@/lib/commission'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const creatorProfileId = url.searchParams.get('creatorProfileId')

  if (!creatorProfileId) {
    return NextResponse.json({ error: 'creatorProfileId is required' }, { status: 400 })
  }

  const [summary, available] = await Promise.all([
    getCreatorEarningsSummary(creatorProfileId),
    getCreatorAvailableBalance(creatorProfileId),
  ])

  return NextResponse.json({
    ok: true,
    summary,
    availableCents: available,
  })
}
