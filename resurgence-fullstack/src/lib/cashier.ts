export const cashierNavItems = [
  { href: '/cashier', label: 'Overview' },
  { href: '/cashier/transactions', label: 'Transactions' },
  { href: '/cashier/invoices', label: 'Invoices' },
  { href: '/cashier/receipts', label: 'Receipts' },
  { href: '/cashier/reports', label: 'Reports' },
] as const;

export const paymentMethodOptions = ['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'CHECK', 'OTHER'] as const;
export const transactionKindOptions = ['COLLECTION', 'REFUND', 'ADJUSTMENT'] as const;
export const invoiceStatusOptions = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'] as const;

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

export function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

export function getBadgeTone(status: string) {
  switch (status) {
    case 'PAID':
    case 'COLLECTION':
      return 'success';
    case 'PARTIALLY_PAID':
    case 'ISSUED':
      return 'warning';
    case 'OVERDUE':
    case 'REFUND':
    case 'CANCELLED':
      return 'danger';
    default:
      return 'neutral';
  }
}
