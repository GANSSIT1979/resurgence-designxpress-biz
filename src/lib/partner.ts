export const partnerNavItems = [
  { href: '/partner', label: 'Overview' },
  { href: '/partner/campaigns', label: 'Campaigns' },
  { href: '/partner/referrals', label: 'Referrals' },
  { href: '/partner/agreements', label: 'Agreements' },
  { href: '/partner/profile', label: 'Profile' },
] as const;

export const partnerCampaignStatusOptions = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as const;
export const partnerReferralStatusOptions = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'] as const;
export const agreementStatusOptions = ['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED'] as const;

export function formatCurrency(amount: number | null | undefined) {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

export function getStatusTone(status: string) {
  switch (status) {
    case 'ACTIVE':
    case 'QUALIFIED':
    case 'WON':
    case 'COMPLETED':
      return 'success';
    case 'ON_HOLD':
    case 'PLANNING':
    case 'CONTACTED':
    case 'DRAFT':
      return 'warning';
    case 'CANCELLED':
    case 'LOST':
    case 'EXPIRED':
    case 'TERMINATED':
      return 'danger';
    default:
      return 'neutral';
  }
}
