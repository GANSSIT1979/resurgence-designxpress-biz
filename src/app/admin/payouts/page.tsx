'use client'

import { useEffect, useState } from 'react'

function money(cents: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format((cents || 0) / 100)
}

export default function AdminPayoutsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/payouts')
    const data = await res.json()
    setItems(data.payouts || [])
    setLoading(false)
  }

  async function approve(id: string) {
    await fetch('/api/admin/payouts/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  async function markPaid(id: string) {
    const referenceNumber = prompt('Payment reference number') || ''
    await fetch('/api/admin/payouts/mark-paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, referenceNumber }),
    })
    await load()
  }

  useEffect(() => { load() }, [])

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Payouts</h1>
        <p className="text-gray-600">Review, approve, and mark creator payouts as paid.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4">Creator</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Requested</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4" colSpan={5}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-4" colSpan={5}>No payout requests.</td></tr>
            ) : items.map((payout) => (
              <tr key={payout.id} className="border-t">
                <td className="p-4">{payout.creatorProfileId}</td>
                <td className="p-4 font-semibold">{money(payout.amountCents)}</td>
                <td className="p-4">{payout.status}</td>
                <td className="p-4">{new Date(payout.createdAt).toLocaleString()}</td>
                <td className="flex gap-2 p-4">
                  {payout.status === 'REQUESTED' && (
                    <button onClick={() => approve(payout.id)} className="rounded-lg bg-black px-3 py-1 text-white">Approve</button>
                  )}
                  {payout.status === 'APPROVED' && (
                    <button onClick={() => markPaid(payout.id)} className="rounded-lg bg-green-700 px-3 py-1 text-white">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
