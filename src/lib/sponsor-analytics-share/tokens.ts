import crypto from 'crypto'
import type { CreateShareTokenInput, SponsorAnalyticsShareTokenRecord } from './types'

function randomToken(size = 24) {
  return crypto.randomBytes(size).toString('base64url')
}

export function createShareTokenString(prefix = 'sas') {
  return `${prefix}_${randomToken(18)}`
}

export function buildShareTokenRecord(input: CreateShareTokenInput, actorUserId: string): SponsorAnalyticsShareTokenRecord {
  const now = new Date().toISOString()
  const token = createShareTokenString()

  return {
    id: crypto.randomUUID(),
    token,
    creatorId: input.creatorId,
    createdByUserId: actorUserId,
    audience: input.audience,
    scope: input.scope,
    sponsorName: input.sponsorName ?? null,
    partnerName: input.partnerName ?? null,
    expiresAt: input.expiresAt ?? null,
    isRevoked: false,
    includeBranding: input.includeBranding ?? true,
    includeTopPosts: input.includeTopPosts ?? true,
    includeCompletionRate: input.includeCompletionRate ?? true,
    includeWatchTime: input.includeWatchTime ?? true,
    includeProducts: input.includeProducts ?? false,
    allowedDomains: input.allowedDomains ?? [],
    createdAt: now,
    updatedAt: now,
  }
}

export function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() <= Date.now()
}
