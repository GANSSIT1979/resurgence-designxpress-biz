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

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(value: Date | string | null | undefined) {
  if (!value) return 'No activity yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No activity yet';

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');

  return rtf.format(Math.round(diffMonths / 12), 'year');
}

export function formatEnumLabel(value: string) {
  return value.replaceAll('_', ' ');
}

export function getFeedSourceLabel(source: FeedResponse['source']) {
  return source === 'content-post' ? 'Creator feed live' : 'Gallery highlights live';
}

export function formatAuthProvider(value: string | null | undefined) {
  switch (String(value || '').toUpperCase()) {
    case 'GOOGLE':
      return 'Gmail / Google';
    case 'MOBILE':
      return 'Mobile OTP';
    case 'PASSWORD':
      return 'Email and password';
    default:
      return value || 'Unknown';
  }
}

export function isSyntheticMemberEmail(value: string | null | undefined) {
  return String(value || '').toLowerCase().endsWith('@mobile.resurgence.local');
}

type MemberProfileUser = {
  id: string;
  displayName: string;
  email: string;
  authProvider: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImageUrl: string | null;
  termsAcceptedAt: Date | string | null;
  isActive: boolean;
  lastLoginAt: Date | string | null;
};

export function getMemberReferralShareCode(user: Pick<MemberProfileUser, 'id' | 'displayName'>) {
  const initials =
    user.displayName
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join('')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 3)
      .toUpperCase() || 'MBR';

  const suffix = user.id.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase();
  return `RSG-${initials}-${suffix}`;
}

export function getMemberProfileCompletion(user: MemberProfileUser) {
  const items = [
    {
      label: 'Display name added',
      done: Boolean(user.displayName.trim()),
      detail: user.displayName || 'Missing display name',
    },
    {
      label: 'Sign-in method connected',
      done: Boolean(user.authProvider),
      detail: formatAuthProvider(user.authProvider),
    },
    {
      label: 'Verification complete',
      done: user.isEmailVerified || user.isPhoneVerified,
      detail: user.isEmailVerified ? 'Email verified' : user.isPhoneVerified ? 'Mobile verified' : 'Verification pending',
    },
    {
      label: 'Profile image or avatar ready',
      done: Boolean(user.profileImageUrl),
      detail: user.profileImageUrl ? 'Avatar connected' : 'Add an avatar when profile editing is enabled',
    },
    {
      label: 'Terms accepted',
      done: Boolean(user.termsAcceptedAt),
      detail: user.termsAcceptedAt ? `Accepted ${formatDate(user.termsAcceptedAt)}` : 'Awaiting consent record',
    },
    {
      label: 'Recent login captured',
      done: Boolean(user.lastLoginAt),
      detail: user.lastLoginAt ? `Last seen ${formatRelativeTime(user.lastLoginAt)}` : 'No login recorded yet',
    },
    {
      label: 'Account access active',
      done: user.isActive,
      detail: user.isActive ? 'Dashboard access is active' : 'Account access is paused',
    },
  ];

  const completed = items.filter((item) => item.done).length;
  const percentage = Math.round((completed / items.length) * 100);

  return {
    completed,
    total: items.length,
    percentage,
    items,
    missingItems: items.filter((item) => !item.done),
  };
}
