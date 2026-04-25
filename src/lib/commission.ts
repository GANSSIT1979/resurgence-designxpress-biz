import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getCreatorEarningsSummary(creatorProfileId: string) {
  const [commissions, events] = await Promise.all([
    prisma.commission.aggregate({
      where: { creatorProfileId },
      _sum: { commissionCents: true, orderAmountCents: true },
      _count: { _all: true },
    }),
    prisma.affiliateEvent.groupBy({
      by: ['type'],
      where: { creatorProfileId },
      _count: { _all: true },
    }),
  ])

  const byType = Object.fromEntries(events.map((e: any) => [e.type, e._count._all]))

  return {
    totalCommissionCents: commissions._sum.commissionCents || 0,
    totalOrderAmountCents: commissions._sum.orderAmountCents || 0,
    totalOrders: commissions._count._all || 0,
    views: byType.VIEW || 0,
    clicks: byType.CLICK || 0,
    shares: byType.SHARE || 0,
    purchases: byType.PURCHASE || 0,
    conversionRate: byType.CLICK ? (byType.PURCHASE || 0) / byType.CLICK : 0,
  }
}

export async function getCreatorAvailableBalance(creatorProfileId: string) {
  const [approved, paid] = await Promise.all([
    prisma.commission.aggregate({
      where: { creatorProfileId, status: 'APPROVED' },
      _sum: { commissionCents: true },
    }),
    prisma.commission.aggregate({
      where: { creatorProfileId, status: 'PAID' },
      _sum: { commissionCents: true },
    }),
  ])

  return (approved._sum.commissionCents || 0) - (paid._sum.commissionCents || 0)
}
