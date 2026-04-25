import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { assertCreatorCanRequestPayout } from '@/lib/commission'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const creatorProfileId = String(body.creatorProfileId || '')
    const payoutAccountId = body.payoutAccountId ? String(body.payoutAccountId) : null
    const amountCents = Number(body.amountCents || 0)
    const notes = body.notes ? String(body.notes) : null

    if (!creatorProfileId || !amountCents) {
      return NextResponse.json(
        { error: 'creatorProfileId and amountCents are required.' },
        { status: 400 },
      )
    }

    const eligibility = await assertCreatorCanRequestPayout(creatorProfileId, amountCents)

    if (!eligibility.ok) {
      return NextResponse.json({ error: eligibility.message }, { status: eligibility.status })
    }

    const payoutRequest = await prisma.creatorPayoutRequest.create({
      data: {
        creatorProfileId,
        payoutAccountId,
        amountCents,
        notes,
        status: 'REQUESTED',
      },
    })

    return NextResponse.json({ ok: true, payoutRequest })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      { status: 500 },
    )
  }
}
