'use client'

import { useMemo, useState } from 'react'
import type { CreateShareTokenInput, SponsorAnalyticsShareTokenRecord } from '@/lib/sponsor-analytics-share/types'

type Props = {
  creatorId: string
}

export default function AnalyticsShareTokenManager({ creatorId }: Props) {
  const [loading, setLoading] = useState(false)
  const [tokenRecord, setTokenRecord] = useState<SponsorAnalyticsShareTokenRecord | null>(null)
  const [audience, setAudience] = useState<CreateShareTokenInput['audience']>('SPONSOR')
  const [scope, setScope] = useState<CreateShareTokenInput['scope']>('SUMMARY')
  const [sponsorName, setSponsorName] = useState('Resurgence DX')

  const shareUrl = useMemo(() => {
    if (!tokenRecord) return ''
    if (tokenRecord.audience === 'PUBLIC_PARTNER_SAFE') {
      return `/partner/analytics/snapshot/${tokenRecord.token}`
    }
    return `/sponsor/analytics/share/${tokenRecord.token}`
  }, [tokenRecord])

  async function createToken() {
    setLoading(true)
    try {
      const res = await fetch('/api/sponsor/analytics/share-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': creatorId,
          'x-user-role': 'CREATOR',
        },
        body: JSON.stringify({
          creatorId,
          audience,
          scope,
          sponsorName,
          includeTopPosts: true,
          includeCompletionRate: true,
          includeWatchTime: true,
          includeProducts: true,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create share token.')
      setTokenRecord(data.tokenRecord)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to create share token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <label className="flex-1">
          <span className="mb-2 block text-sm text-zinc-400">Audience</span>
          <select value={audience} onChange={(e) => setAudience(e.target.value as CreateShareTokenInput['audience'])} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none">
            <option value="SPONSOR">Sponsor</option>
            <option value="PARTNER">Partner</option>
            <option value="PUBLIC_PARTNER_SAFE">Public Partner-Safe</option>
          </select>
        </label>
        <label className="flex-1">
          <span className="mb-2 block text-sm text-zinc-400">Scope</span>
          <select value={scope} onChange={(e) => setScope(e.target.value as CreateShareTokenInput['scope'])} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none">
            <option value="SUMMARY">Summary</option>
            <option value="PRINT_CARD">Print Card</option>
            <option value="SNAPSHOT">Snapshot</option>
          </select>
        </label>
        <label className="flex-[1.5]">
          <span className="mb-2 block text-sm text-zinc-400">Sponsor Label</span>
          <input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" />
        </label>
        <button onClick={createToken} disabled={loading} className="rounded-2xl bg-white px-5 py-3 font-medium text-zinc-950 disabled:opacity-60">
          {loading ? 'Creating...' : 'Create Share Link'}
        </button>
      </div>

      {tokenRecord ? (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-200">Share URL</p>
          <code className="mt-2 block break-all text-sm text-white">{shareUrl}</code>
        </div>
      ) : null}
    </div>
  )
}
