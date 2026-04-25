import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') || undefined
    const creatorProfileId = url.searchParams.get('creatorProfileId') || undefined

    const payouts = await prisma.creatorPayoutRequest.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(creatorProfileId ? { creatorProfileId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ ok: true, payouts })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      { status: 500 },
    )
  }
}
