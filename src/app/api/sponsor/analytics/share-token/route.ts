import { NextResponse } from 'next/server'
import { assertCanCreateShareToken, getShareActorFromHeaders } from '@/lib/sponsor-analytics-share/auth'
import { buildShareTokenRecord } from '@/lib/sponsor-analytics-share/tokens'
import type { CreateShareTokenInput } from '@/lib/sponsor-analytics-share/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const actor = getShareActorFromHeaders(request.headers)
    const auth = assertCanCreateShareToken(actor)

    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: auth.status })
    }

    const body = (await request.json()) as Partial<CreateShareTokenInput>

    if (!body.creatorId || !body.audience || !body.scope) {
      return NextResponse.json(
        { error: 'creatorId, audience, and scope are required.' },
        { status: 400 }
      )
    }

    const record = buildShareTokenRecord(
      {
        creatorId: body.creatorId,
        audience: body.audience,
        scope: body.scope,
        sponsorName: body.sponsorName,
        partnerName: body.partnerName,
        expiresAt: body.expiresAt,
        includeBranding: body.includeBranding,
        includeTopPosts: body.includeTopPosts,
        includeCompletionRate: body.includeCompletionRate,
        includeWatchTime: body.includeWatchTime,
        includeProducts: body.includeProducts,
        allowedDomains: body.allowedDomains,
      },
      actor.userId
    )

    // TODO: persist with Prisma once the share token table is added.
    return NextResponse.json({ ok: true, tokenRecord: record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      { status: 500 }
    )
  }
}
