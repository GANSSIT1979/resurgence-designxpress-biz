export const sponsorNavItems = [
  { href: '/sponsor/dashboard', label: 'Overview' },
  { href: '/sponsor/applications', label: 'Applications' },
  { href: '/sponsor/packages', label: 'Packages' },
  { href: '/sponsor/placements', label: 'Feed Placements' },
  { href: '/sponsor/deliverables', label: 'Deliverables' },
  { href: '/sponsor/billing', label: 'Billing' },
  { href: '/sponsor/profile', label: 'Profile' },
] as const;

export const deliverableStatusOptions = ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'NEEDS_REVISION', 'COMPLETED'] as const;
export const sponsorSubmissionStatusOptions = ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'REJECTED', 'CONVERTED_TO_ACTIVE_SPONSOR'] as const;

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function getStatusTone(status: string) {
  switch (status) {
    case 'APPROVED':
    case 'PAID':
    case 'COMPLETED':
      return 'success';
    case 'UNDER_REVIEW':
    case 'IN_PROGRESS':
    case 'ISSUED':
    case 'PARTIALLY_PAID':
    case 'SUBMITTED':
      return 'warning';
    case 'REJECTED':
    case 'OVERDUE':
      return 'danger';
    default:
      return 'neutral';
  }
}
