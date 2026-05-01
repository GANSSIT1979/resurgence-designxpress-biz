import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

async function getLiveMetrics() {
  if (!hasUsableDatabaseUrl()) {
    return { ok: false, error: 'Database is not configured.', timestamp: new Date().toISOString() };
  }

  const metricDelegate = (prisma as any).observabilityMetric;
  const alertDelegate = (prisma as any).observabilityAlert;
  const invoiceDelegate = (prisma as any).invoice;
  const sponsorDelegate = (prisma as any).sponsorSubmission;

  const [metrics, alerts, invoices, sponsors] = await Promise.all([
    metricDelegate?.findMany ? metricDelegate.findMany({ orderBy: { createdAt: 'desc' }, take: 250 }) : Promise.resolve([]),
    alertDelegate?.findMany ? alertDelegate.findMany({ orderBy: { createdAt: 'desc' }, take: 25 }) : Promise.resolve([]),
    invoiceDelegate?.findMany ? invoiceDelegate.findMany({ orderBy: { createdAt: 'desc' }, take: 250 }) : Promise.resolve([]),
    sponsorDelegate?.findMany ? sponsorDelegate.findMany({ orderBy: { createdAt: 'desc' }, take: 250 }) : Promise.resolve([]),
  ]);

  const paidInvoices = invoices.filter((invoice: any) => invoice.status === 'PAID');
  const unpaidInvoices = invoices.filter((invoice: any) => !['PAID', 'CANCELLED'].includes(String(invoice.status || 'DRAFT')));
  const revenue = paidInvoices.reduce((sum: number, invoice: any) => sum + Number(invoice.amount || invoice.total || invoice.totalAmount || 0), 0);
  const outstanding = unpaidInvoices.reduce((sum: number, invoice: any) => sum + Number(invoice.balanceAmount || invoice.amount || invoice.total || 0), 0);

  return {
    ok: true,
    timestamp: new Date().toISOString(),
    revenue,
    outstanding,
    invoices: {
      total: invoices.length,
      paid: paidInvoices.length,
      unpaid: unpaidInvoices.length,
      conversionRate: invoices.length ? paidInvoices.length / invoices.length : 0,
    },
    sponsors: {
      total: sponsors.length,
      approved: sponsors.filter((item: any) => item.status === 'APPROVED' || item.status === 'CONVERTED_TO_ACTIVE_SPONSOR').length,
      underReview: sponsors.filter((item: any) => String(item.status || '').includes('REVIEW')).length,
    },
    metrics: metrics.slice(0, 50),
    alerts: alerts.slice(0, 10),
  };
}

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = async () => {
        if (closed) return;
        try {
          const data = await getLiveMetrics();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ ok: false, error: 'metrics_stream_failed' })}\n\n`));
        }
      };

      await send();
      const interval = setInterval(send, 5000);

      setTimeout(() => {
        closed = true;
        clearInterval(interval);
        controller.close();
      }, 55_000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
