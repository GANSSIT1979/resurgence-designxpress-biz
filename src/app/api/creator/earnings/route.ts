import { NextResponse } from 'next/server'
import { getCreatorEarningsSummary } from '@/lib/commission'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const creatorProfileId = url.searchParams.get('creatorProfileId')

    if (!creatorProfileId) {
      return NextResponse.json({ error: 'creatorProfileId is required.' }, { status: 400 })
    }

    const summary = await getCreatorEarningsSummary(creatorProfileId)

    return NextResponse.json({ ok: true, summary })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      { status: 500 },
    )
  }
}
