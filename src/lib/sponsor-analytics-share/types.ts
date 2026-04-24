export type SponsorShareAudience = 'SPONSOR' | 'PARTNER' | 'PUBLIC_PARTNER_SAFE'

export type SponsorShareScope = 'SUMMARY' | 'PRINT_CARD' | 'SNAPSHOT'

export type SponsorAnalyticsShareTokenRecord = {
  id: string
  token: string
  creatorId: string
  createdByUserId: string
  audience: SponsorShareAudience
  scope: SponsorShareScope
  sponsorName?: string | null
  partnerName?: string | null
  expiresAt?: string | null
  isRevoked: boolean
  includeBranding: boolean
  includeTopPosts: boolean
  includeCompletionRate: boolean
  includeWatchTime: boolean
  includeProducts: boolean
  allowedDomains?: string[]
  createdAt: string
  updatedAt: string
}

export type SponsorSafeAnalyticsSummary = {
  creator: {
    id: string
    displayName: string
    handle?: string | null
    avatarUrl?: string | null
    category?: string | null
  }
  sponsor: {
    name?: string | null
    logoUrl?: string | null
    accentLabel?: string | null
  }
  period: {
    label: '7D' | '30D' | 'CUSTOM'
    startDate: string
    endDate: string
  }
  headline: {
    totalViews: number
    uniqueViews: number
    completedViews: number
    completionRate: number
    watchTimeSeconds: number
    avgWatchTimeSeconds: number
  }
  topPosts: Array<{
    id: string
    title: string
    slug?: string | null
    thumbnailUrl?: string | null
    viewCount: number
    completionRate: number
    watchTimeSeconds: number
    creatorLink?: string | null
    productLink?: string | null
  }>
  notes?: string[]
  generatedAt: string
}

export type PartnerSafeSnapshot = {
  token: string
  creatorDisplayName: string
  creatorHandle?: string | null
  creatorAvatarUrl?: string | null
  periodLabel: string
  stats: {
    totalViews: number
    uniqueViews: number
    completionRate: number
    avgWatchTimeSeconds: number
  }
  featuredPost?: {
    title: string
    thumbnailUrl?: string | null
    creatorLink?: string | null
    productLink?: string | null
  } | null
  sponsorLabel?: string | null
  generatedAt: string
}

export type CreateShareTokenInput = {
  creatorId: string
  audience: SponsorShareAudience
  scope: SponsorShareScope
  sponsorName?: string
  partnerName?: string
  expiresAt?: string
  includeBranding?: boolean
  includeTopPosts?: boolean
  includeCompletionRate?: boolean
  includeWatchTime?: boolean
  includeProducts?: boolean
  allowedDomains?: string[]
}
