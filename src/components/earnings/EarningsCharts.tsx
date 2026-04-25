'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function EarningsCharts({ summary }: { summary: any }) {
  const funnel = [
    { name: 'Views', value: summary.views || 0 },
    { name: 'Clicks', value: summary.clicks || 0 },
    { name: 'Purchases', value: summary.purchases || 0 },
  ]

  const revenue = [
    { name: 'Revenue', value: (summary.totalOrderAmountCents || 0) / 100 },
    { name: 'Commission', value: (summary.totalCommissionCents || 0) / 100 },
  ]

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Conversion Funnel</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={funnel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Revenue vs Commission</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
