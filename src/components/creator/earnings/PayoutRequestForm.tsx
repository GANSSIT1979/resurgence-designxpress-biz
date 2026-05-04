'use client'

import { useState } from 'react'

export function PayoutRequestForm({ creatorProfileId, availableCents }: { creatorProfileId: string; availableCents: number }) {
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function submit() {
    const amountCents = Math.round(Number(amount) * 100)
    if (!amountCents || amountCents < 50000) {
      setStatus('Minimum payout is ₱500.00')
      return
    }
    if (amountCents > availableCents) {
      setStatus('Amount exceeds available balance')
      return
    }

    const res = await fetch('/api/creator/payouts/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorProfileId, amountCents }),
    })

    setStatus(res.ok ? 'Payout request submitted' : 'Failed to submit payout request')
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Request Payout</h2>
      <div className="mt-4 flex gap-3">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in PHP"
          className="flex-1 rounded-xl border px-4 py-2"
          type="number"
          min="500"
        />
        <button onClick={submit} className="rounded-xl bg-black px-5 py-2 font-semibold text-white">
          Withdraw
        </button>
      </div>
      {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}
    </div>
  )
}
