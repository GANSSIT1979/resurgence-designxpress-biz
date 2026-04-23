import type { FeedResponse } from '@/lib/feed/types';

export const memberNavItems = [
  { href: '/member', label: 'Overview' },
  { href: '/feed', label: 'Community Feed' },
  { href: '/shop', label: 'Official Merch' },
  { href: '/account/orders', label: 'Order Lookup' },
  { href: '/creators', label: 'Creators' },
] as const;

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatEnumLabel(value: string) {
  return value.replaceAll('_', ' ');
}

export function getFeedSourceLabel(source: FeedResponse['source']) {
  return source === 'content-post' ? 'Creator feed live' : 'Gallery highlights live';
}
