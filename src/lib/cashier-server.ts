import { InvoiceStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type DocumentPrefix = 'INV' | 'TXN' | 'OR';

export async function generateDocumentNumber(prefix: DocumentPrefix) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const period = `${year}${month}`;

  const source =
    prefix === 'INV'
      ? await prisma.invoice.findMany({
          select: { invoiceNumber: true },
          where: { invoiceNumber: { startsWith: `${prefix}-${period}-` } },
          orderBy: { invoiceNumber: 'desc' },
        })
      : prefix === 'TXN'
        ? await prisma.cashierTransaction.findMany({
            select: { transactionNumber: true },
            where: { transactionNumber: { startsWith: `${prefix}-${period}-` } },
            orderBy: { transactionNumber: 'desc' },
          })
        : await prisma.receipt.findMany({
            select: { receiptNumber: true },
            where: { receiptNumber: { startsWith: `${prefix}-${period}-` } },
            orderBy: { receiptNumber: 'desc' },
          });

  const latestValue = source[0]
    ? 'invoiceNumber' in source[0]
      ? source[0].invoiceNumber
      : 'transactionNumber' in source[0]
        ? source[0].transactionNumber
        : source[0].receiptNumber
    : null;

  const latestSequence = latestValue ? Number(latestValue.split('-').pop()) || 0 : 0;
  return `${prefix}-${period}-${String(latestSequence + 1).padStart(4, '0')}`;
}

export async function syncInvoiceBalance(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.status === 'CANCELLED') return invoice;

  const transactions = await prisma.cashierTransaction.findMany({
    where: { invoiceId },
    select: { amount: true, kind: true },
  });

  const netPaid = transactions.reduce((total, entry) => {
    if (entry.kind === 'COLLECTION') return total + entry.amount;
    if (entry.kind === 'REFUND') return total - entry.amount;
    return total;
  }, 0);

  const balanceAmount = Math.max(invoice.amount - netPaid, 0);
  let status: InvoiceStatus = invoice.status;

  if (balanceAmount <= 0) {
    status = 'PAID';
  } else if (balanceAmount < invoice.amount) {
    status = 'PARTIALLY_PAID';
  } else if (invoice.dueDate && new Date(invoice.dueDate).getTime() < Date.now()) {
    status = 'OVERDUE';
  } else if (invoice.status !== 'DRAFT') {
    status = 'ISSUED';
  }

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { balanceAmount, status },
  });
}

export async function getCashierReportSummary() {
  const [invoices, transactions, receipts] = await Promise.all([
    prisma.invoice.findMany(),
    prisma.cashierTransaction.findMany(),
    prisma.receipt.findMany(),
  ]);

  const totalInvoiced = invoices.reduce((sum, item) => sum + item.amount, 0);
  const totalOutstanding = invoices.reduce((sum, item) => sum + item.balanceAmount, 0);
  const totalCollected = transactions.filter((item) => item.kind === 'COLLECTION').reduce((sum, item) => sum + item.amount, 0);
  const totalRefunded = transactions.filter((item) => item.kind === 'REFUND').reduce((sum, item) => sum + item.amount, 0);
  const totalAdjustments = transactions.filter((item) => item.kind === 'ADJUSTMENT').reduce((sum, item) => sum + item.amount, 0);
  const collectionRate = totalInvoiced > 0 ? totalCollected / totalInvoiced : 0;
  const averageInvoiceValue = invoices.length ? Math.round(totalInvoiced / invoices.length) : 0;

  const statusBreakdown = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'].map((status) => ({
    status,
    count: invoices.filter((item) => item.status === status).length,
    outstanding: invoices.filter((item) => item.status === status).reduce((sum, item) => sum + item.balanceAmount, 0),
  }));

  const paymentMethodBreakdown = ['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'CHECK', 'OTHER'].map((method) => ({
    method,
    amount: transactions
      .filter((item) => item.paymentMethod === method && item.kind === 'COLLECTION')
      .reduce((sum, item) => sum + item.amount, 0),
    count: transactions.filter((item) => item.paymentMethod === method).length,
  }));

  const transactionMix = ['COLLECTION', 'REFUND', 'ADJUSTMENT'].map((kind) => ({
    kind,
    amount: transactions.filter((item) => item.kind === kind).reduce((sum, item) => sum + item.amount, 0),
    count: transactions.filter((item) => item.kind === kind).length,
  }));

  const monthKeys = getRecentMonthKeys(6);
  const monthlyTrend = monthKeys.map((key) => {
    const label = formatMonthLabel(key);
    const invoiced = invoices
      .filter((item) => toMonthKey(item.issueDate) === key)
      .reduce((sum, item) => sum + item.amount, 0);
    const collected = transactions
      .filter((item) => item.kind === 'COLLECTION' && toMonthKey(item.transactionDate) === key)
      .reduce((sum, item) => sum + item.amount, 0);
    const refunded = transactions
      .filter((item) => item.kind === 'REFUND' && toMonthKey(item.transactionDate) === key)
      .reduce((sum, item) => sum + item.amount, 0);

    return { key, label, invoiced, collected, refunded };
  });

  const agingBuckets = [
    { label: 'Current', minDays: Number.NEGATIVE_INFINITY, maxDays: 0 },
    { label: '1-30 days', minDays: 1, maxDays: 30 },
    { label: '31-60 days', minDays: 31, maxDays: 60 },
    { label: '61-90 days', minDays: 61, maxDays: 90 },
    { label: '90+ days', minDays: 91, maxDays: Number.POSITIVE_INFINITY },
  ].map((bucket) => {
    const matching = invoices.filter((item) => {
      if (item.balanceAmount <= 0) return false;
      const overdueDays = getOverdueDays(item.dueDate);
      return overdueDays >= bucket.minDays && overdueDays <= bucket.maxDays;
    });

    return {
      label: bucket.label,
      total: matching.reduce((sum, item) => sum + item.balanceAmount, 0),
      count: matching.length,
    };
  });

  const topOutstanding = invoices
    .filter((item) => item.balanceAmount > 0)
    .sort((left, right) => right.balanceAmount - left.balanceAmount)
    .slice(0, 6)
    .map((item) => ({
      invoiceId: item.id,
      invoiceNumber: item.invoiceNumber,
      companyName: item.companyName,
      status: item.status,
      dueDate: item.dueDate?.toISOString() ?? null,
      balanceAmount: item.balanceAmount,
    }));

  return {
    totals: {
      totalInvoiced,
      totalOutstanding,
      totalCollected,
      totalRefunded,
      totalAdjustments,
      collectionRate,
      averageInvoiceValue,
      invoiceCount: invoices.length,
      transactionCount: transactions.length,
      receiptCount: receipts.length,
    },
    statusBreakdown,
    paymentMethodBreakdown,
    transactionMix,
    monthlyTrend,
    agingBuckets,
    topOutstanding,
  };
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getRecentMonthKeys(count: number) {
  const result: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);

  for (let index = count - 1; index >= 0; index -= 1) {
    const value = new Date(cursor.getFullYear(), cursor.getMonth() - index, 1);
    result.push(toMonthKey(value));
  }

  return result;
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-PH', { month: 'short', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

function getOverdueDays(dueDate: Date | null) {
  if (!dueDate) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const raw = Math.floor((Date.now() - dueDate.getTime()) / msPerDay);
  return raw > 0 ? raw : 0;
}
