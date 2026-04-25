import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const MIN_PAYOUT_CENTS = Number(process.env.MIN_CREATOR_PAYOUT_CENTS || 50000)

export async function getCreatorEarningsSummary(creatorProfileId: string) {
  const [commissionAgg, commissionByStatus, events, payoutAgg] = await Promise.all([
    prisma.commission.aggregate({
      where: { creatorProfileId },
      _sum: { commissionCents: true, orderAmountCents: true },
      _count: { _all: true },
    }),
    prisma.commission.groupBy({
      by: ['status'],
      where: { creatorProfileId },
      _sum: { commissionCents: true },
      _count: { _all: true },
    }),
    prisma.affiliateEvent.groupBy({
      by: ['type'],
      where: { creatorProfileId },
      _count: { _all: true },
    }),
    prisma.creatorPayoutRequest.aggregate({
      where: { creatorProfileId, status: { in: ['REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PAID'] } },
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
  ])

  const eventCounts = Object.fromEntries(events.map((event: any) => [event.type, event._count._all]))
  const commissionStatus = Object.fromEntries(
    commissionByStatus.map((row: any) => [row.status, row._sum.commissionCents || 0]),
  )

  const approvedCents = commissionStatus.APPROVED || 0
  const paidCommissionCents = commissionStatus.PAID || 0
  const requestedOrPaidPayoutCents = payoutAgg._sum.amountCents || 0
  const availableCents = Math.max(0, approvedCents - paidCommissionCents - requestedOrPaidPayoutCents)

  return {
    totalCommissionCents: commissionAgg._sum.commissionCents || 0,
    totalOrderAmountCents: commissionAgg._sum.orderAmountCents || 0,
    totalOrders: commissionAgg._count._all || 0,
    pendingCommissionCents: commissionStatus.PENDING || 0,
    approvedCommissionCents: approvedCents,
    paidCommissionCents,
    availableCents,
    requestedPayoutCents: requestedOrPaidPayoutCents,
    payoutRequestCount: payoutAgg._count._all || 0,
    views: eventCounts.VIEW || 0,
    clicks: eventCounts.CLICK || 0,
    shares: eventCounts.SHARE || 0,
    purchases: eventCounts.PURCHASE || 0,
    clickThroughRate: eventCounts.VIEW ? (eventCounts.CLICK || 0) / eventCounts.VIEW : 0,
    conversionRate: eventCounts.CLICK ? (eventCounts.PURCHASE || 0) / eventCounts.CLICK : 0,
    minPayoutCents: MIN_PAYOUT_CENTS,
    canRequestPayout: availableCents >= MIN_PAYOUT_CENTS,
  }
}

export async function assertCreatorCanRequestPayout(creatorProfileId: string, amountCents: number) {
  const summary = await getCreatorEarningsSummary(creatorProfileId)

  if (amountCents < MIN_PAYOUT_CENTS) {
    return { ok: false, status: 400, message: `Minimum payout is ${MIN_PAYOUT_CENTS} cents.` }
  }

  if (amountCents > summary.availableCents) {
    return { ok: false, status: 400, message: 'Requested payout exceeds available balance.' }
  }

  return { ok: true, summary }
}
