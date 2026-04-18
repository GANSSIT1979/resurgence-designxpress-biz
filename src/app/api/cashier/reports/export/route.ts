import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCashierReportSummary } from '@/lib/cashier-server';

type ExportFormat = 'csv' | 'json';
type ExportDataset = 'summary' | 'invoices' | 'transactions' | 'receipts';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = (url.searchParams.get('format') || 'csv') as ExportFormat;
  const dataset = (url.searchParams.get('dataset') || 'summary') as ExportDataset;

  if (!['csv', 'json'].includes(format) || !['summary', 'invoices', 'transactions', 'receipts'].includes(dataset)) {
    return NextResponse.json({ error: 'Unsupported export format or dataset.' }, { status: 400 });
  }

  const payload = await loadExportDataset(dataset);
  const filename = `resurgence-cashier-${dataset}-${new Date().toISOString().slice(0, 10)}.${format}`;

  if (format === 'json') {
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  const csv = toCsv(payload);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

async function loadExportDataset(dataset: ExportDataset) {
  switch (dataset) {
    case 'invoices':
      return prisma.invoice.findMany({ orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }] });
    case 'transactions':
      return prisma.cashierTransaction.findMany({ orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }] });
    case 'receipts':
      return prisma.receipt.findMany({ orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }] });
    default: {
      const summary = await getCashierReportSummary();
      return [
        ...Object.entries(summary.totals).map(([key, value]) => ({
          section: 'totals',
          label: key,
          value,
        })),
        ...summary.statusBreakdown.map((item) => ({
          section: 'statusBreakdown',
          label: item.status,
          count: item.count,
          amount: item.outstanding,
        })),
        ...summary.paymentMethodBreakdown.map((item) => ({
          section: 'paymentMethodBreakdown',
          label: item.method,
          count: item.count,
          amount: item.amount,
        })),
        ...summary.monthlyTrend.map((item) => ({
          section: 'monthlyTrend',
          label: item.label,
          invoiced: item.invoiced,
          collected: item.collected,
          refunded: item.refunded,
        })),
      ];
    }
  }
}

function toCsv(input: unknown) {
  if (!Array.isArray(input) || input.length === 0) {
    return 'No data\n';
  }

  const rows = input.map((item) => normalizeRow(item));
  const headers = Array.from(new Set(rows.flatMap((item) => Object.keys(item))));
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(String(row[header] ?? ''))).join(',')),
  ];

  return lines.join('\n');
}

function normalizeRow(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, entry instanceof Date ? entry.toISOString() : entry]),
    );
  }

  return { value };
}

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
