import { NextResponse } from 'next/server'
import { buildPartnerSafeSnapshot } from '@/lib/sponsor-analytics-share/buildSnapshot'
import type { SponsorAnalyticsShareTokenRecord, SponsorSafeAnalyticsSummary } from '@/lib/sponsor-analytics-share/types'

export const runtime = 'nodejs'

function getDemoToken(token: string): SponsorAnalyticsShareTokenRecord {
  return {
    id: 'share_1',
    token,
    creatorId: 'creator_demo',
    createdByUserId: 'user_demo',
    audience: 'PUBLIC_PARTNER_SAFE',
    scope: 'SNAPSHOT',
    sponsorName: 'Resurgence DX',
    partnerName: 'Partner Network',
    expiresAt: null,
    isRevoked: false,
    includeBranding: true,
    includeTopPosts: true,
    includeCompletionRate: true,
    includeWatchTime: true,
    includeProducts: true,
    allowedDomains: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function getDemoSummary(): SponsorSafeAnalyticsSummary {
  return {
    creator: {
      id: 'creator_demo',
      displayName: 'Coach Alex Rivera',
      handle: '@coachalex',
      avatarUrl: 'https://placehold.co/96x96/png',
      category: 'Sports Creator',
    },
    sponsor: {
      name: 'Resurgence DX',
      logoUrl: 'https://placehold.co/160x48/png',
      accentLabel: 'Creator Performance Snapshot',
    },
    period: {
      label: '30D',
      startDate: '2026-03-24',
      endDate: '2026-04-23',
    },
    headline: {
      totalViews: 184320,
      uniqueViews: 132880,
      completedViews: 62114,
      completionRate: 33.7,
      watchTimeSeconds: 918420,
      avgWatchTimeSeconds: 18.4,
    },
    topPosts: [
      {
        id: 'post_1',
        title: 'Championship warm-up drill',
        slug: 'championship-warm-up-drill',
        thumbnailUrl: 'https://placehold.co/640x360/png',
        viewCount: 58220,
        completionRate: 37.2,
        watchTimeSeconds: 213000,
        creatorLink: '/creators/coach-alex-rivera',
        productLink: '/shop/product/performance-shirt',
      },
    ],
    notes: ['Partner-safe snapshot with rounded metrics.'],
    generatedAt: new Date().toISOString(),
  }
}

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const tokenRecord = getDemoToken(token)
  const summary = getDemoSummary()
  const snapshot = buildPartnerSafeSnapshot(tokenRecord, summary)

  return NextResponse.json({ ok: true, tokenRecord, summary, snapshot })
}
