import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payoutRequestId = String(body.payoutRequestId || '')
    const reviewedById = body.reviewedById ? String(body.reviewedById) : null

    if (!payoutRequestId) {
      return NextResponse.json({ error: 'payoutRequestId is required.' }, { status: 400 })
    }

    const payoutRequest = await prisma.creatorPayoutRequest.update({
      where: { id: payoutRequestId },
      data: {
        status: 'APPROVED',
        reviewedById,
        reviewedAt: new Date(),
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
