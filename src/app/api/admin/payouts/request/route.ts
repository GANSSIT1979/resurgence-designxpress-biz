import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body = await req.json()

  const { creatorProfileId, amountCents, payoutAccountId } = body

  if (!creatorProfileId || !amountCents) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const request = await prisma.creatorPayoutRequest.create({
    data: {
      creatorProfileId,
      amountCents,
      payoutAccountId,
      status: 'REQUESTED',
    },
  })

  return NextResponse.json({ ok: true, request })
}
