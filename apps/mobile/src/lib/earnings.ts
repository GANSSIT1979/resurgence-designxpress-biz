import { apiFetch } from './api'

export function getCreatorEarnings(creatorProfileId: string) {
  return apiFetch(`/api/creator/earnings?creatorProfileId=${encodeURIComponent(creatorProfileId)}`)
}

export function requestCreatorPayout(input: { creatorProfileId: string; amountCents: number; payoutAccountId?: string }) {
  return apiFetch('/api/creator/payouts/request', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
