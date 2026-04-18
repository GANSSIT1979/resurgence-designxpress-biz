export const staffNavItems = [
  { href: '/staff', label: 'Overview' },
  { href: '/staff/tasks', label: 'Tasks' },
  { href: '/staff/inquiries', label: 'Inquiries' },
  { href: '/staff/schedule', label: 'Schedule' },
  { href: '/staff/announcements', label: 'Announcements' },
] as const;

export const staffTaskStatusOptions = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'] as const;
export const staffTaskPriorityOptions = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export const announcementLevelOptions = ['INFO', 'SUCCESS', 'WARNING', 'URGENT'] as const;
export const inquiryStatusOptions = ['NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUALIFIED', 'PENDING_RESPONSE', 'CLOSED', 'ARCHIVED'] as const;

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

export function toDateTimeLocalValue(date: Date | string | null | undefined) {
  if (!date) return '';
  const value = new Date(date);
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function getStatusTone(status: string) {
  switch (status) {
    case 'COMPLETED':
    case 'SUCCESS':
    case 'APPROVED':
    case 'QUALIFIED':
    case 'CLOSED':
      return 'success';
    case 'URGENT':
    case 'WARNING':
    case 'BLOCKED':
    case 'OVERDUE':
      return 'danger';
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
    case 'PENDING_RESPONSE':
    case 'CONTACTED':
      return 'warning';
    default:
      return 'neutral';
  }
}
