export type EarningsSummary = {
  totalCommissionCents: number
  totalOrderAmountCents: number
  totalOrders: number
  views: number
  clicks: number
  shares: number
  purchases: number
  conversionRate: number
}

function money(cents: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format((cents || 0) / 100)
}

export function EarningsCards({ summary, availableCents }: { summary: EarningsSummary; availableCents: number }) {
  const cards = [
    ['Available', money(availableCents)],
    ['Total Commission', money(summary.totalCommissionCents)],
    ['Revenue Driven', money(summary.totalOrderAmountCents)],
    ['Conversions', String(summary.purchases)],
    ['CTR', summary.views ? `${((summary.clicks / summary.views) * 100).toFixed(2)}%` : '0%'],
    ['Conversion Rate', `${((summary.conversionRate || 0) * 100).toFixed(2)}%`],
  ]

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
        </div>
      ))}
    </section>
  )
}
