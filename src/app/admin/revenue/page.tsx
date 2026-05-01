import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type DashboardInvoice = {
  id: string;
  invoiceNumber?: string | null;
  status?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  currency?: string | null;
  total?: number | string | null;
  createdAt?: Date | string | null;
  metadataJson?: string | null;
};

type SponsorSubmission = {
  id: string;
  status?: string | null;
  companyName?: string | null;
  interestedPackage?: string | null;
  createdAt?: Date | string | null;
};

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

function money(value: unknown, currency = 'PHP') {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(amount);
}

function percent(value: number) {
  return `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;
}

function safeDate(value: unknown) {
  return value ? new Date(value as string).toLocaleDateString('en-PH') : '-';
}

async function getRevenueData() {
  if (!hasUsableDatabaseUrl()) {
    return {
      invoices: [] as DashboardInvoice[],
      submissions: [] as SponsorSubmission[],
      error: 'Database is not configured. Set a valid DATABASE_URL to load revenue analytics.',
    };
  }

  try {
    const invoiceDelegate = (prisma as any).invoice;
    const submissionDelegate = (prisma as any).sponsorSubmission;

    const [invoices, submissions] = await Promise.all([
      invoiceDelegate?.findMany
        ? invoiceDelegate.findMany({ orderBy: [{ createdAt: 'desc' }], take: 250 })
        : Promise.resolve([]),
      submissionDelegate?.findMany
        ? submissionDelegate.findMany({ orderBy: [{ createdAt: 'desc' }], take: 250 })
        : Promise.resolve([]),
    ]);

    return { invoices: invoices as DashboardInvoice[], submissions: submissions as SponsorSubmission[], error: null };
  } catch (error) {
    console.error('[admin-revenue] Failed to load revenue analytics.', error);
    return {
      invoices: [] as DashboardInvoice[],
      submissions: [] as SponsorSubmission[],
      error: 'Unable to load analytics. Check database schema, migrations, and Prisma client generation.',
    };
  }
}

export default async function AdminRevenueDashboardPage() {
  const { invoices, submissions, error } = await getRevenueData();

  const paidInvoices = invoices.filter((invoice) => invoice.status === 'PAID');
  const sentInvoices = invoices.filter((invoice) => invoice.status === 'SENT');
  const draftInvoices = invoices.filter((invoice) => invoice.status === 'DRAFT');
  const unpaidInvoices = invoices.filter((invoice) => !['PAID', 'CANCELLED'].includes(String(invoice.status || 'DRAFT')));

  const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const outstandingRevenue = unpaidInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const invoiceConversionRate = invoices.length ? (paidInvoices.length / invoices.length) * 100 : 0;

  const sponsorApproved = submissions.filter((item) => item.status === 'APPROVED').length;
  const sponsorReview = submissions.filter((item) => item.status === 'UNDER_REVIEW').length;
  const sponsorConversionRate = submissions.length ? (sponsorApproved / submissions.length) * 100 : 0;

  const unpaidAlerts = unpaidInvoices.slice(0, 12);
  const recentPaid = paidInvoices.slice(0, 8);

  return (
    <main style={{ padding: 24, maxWidth: 1220, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 2, color: '#666', fontSize: 12 }}>Admin / PayPal Analytics</p>
          <h1 style={{ margin: '6px 0 0', fontSize: 36 }}>Revenue Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/admin/invoices" style={{ textDecoration: 'none', fontWeight: 700 }}>Invoices</Link>
          <Link href="/admin" style={{ textDecoration: 'none', fontWeight: 700 }}>Admin</Link>
        </div>
      </div>

      {error ? (
        <div style={{ border: '1px solid #f5c2c7', background: '#fff5f5', color: '#842029', padding: 16, borderRadius: 12, marginBottom: 20 }}>
          {error}
        </div>
      ) : null}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard label="Paid Revenue" value={money(paidRevenue)} />
        <MetricCard label="Outstanding" value={money(outstandingRevenue)} />
        <MetricCard label="Invoice Conversion" value={percent(invoiceConversionRate)} />
        <MetricCard label="Sponsor Conversion" value={percent(sponsorConversionRate)} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatusCard title="Invoice Pipeline" rows={[
          ['Draft', draftInvoices.length],
          ['Sent / Awaiting Payment', sentInvoices.length],
          ['Paid', paidInvoices.length],
          ['Unpaid Alerts', unpaidInvoices.length],
        ]} />
        <StatusCard title="Sponsor Funnel" rows={[
          ['Submissions', submissions.length],
          ['Under Review', sponsorReview],
          ['Approved', sponsorApproved],
          ['Conversion Rate', percent(sponsorConversionRate)],
        ]} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
        <Panel title="Unpaid Invoice Alerts">
          {unpaidAlerts.length ? unpaidAlerts.map((invoice) => (
            <div key={invoice.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
              <strong>{invoice.invoiceNumber || invoice.id}</strong>
              <div>{invoice.customerName || invoice.customerEmail || 'Customer'} · {invoice.status || 'DRAFT'}</div>
              <div style={{ color: '#842029', fontWeight: 800 }}>{money(invoice.total, invoice.currency || 'PHP')}</div>
              <small style={{ color: '#666' }}>Created {safeDate(invoice.createdAt)}</small>
            </div>
          )) : <p style={{ color: '#666' }}>No unpaid invoices requiring attention.</p>}
        </Panel>

        <Panel title="Recent Paid Invoices">
          {recentPaid.length ? recentPaid.map((invoice) => (
            <div key={invoice.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
              <strong>{invoice.invoiceNumber || invoice.id}</strong>
              <div>{invoice.customerName || invoice.customerEmail || 'Customer'}</div>
              <div style={{ color: '#0f766e', fontWeight: 800 }}>{money(invoice.total, invoice.currency || 'PHP')}</div>
              <small style={{ color: '#666' }}>Created {safeDate(invoice.createdAt)}</small>
            </div>
          )) : <p style={{ color: '#666' }}>No paid invoices yet.</p>}
        </Panel>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
      <p style={{ margin: 0, color: '#666' }}>{label}</p>
      <strong style={{ fontSize: 30 }}>{value}</strong>
    </div>
  );
}

function StatusCard({ title, rows }: { title: string; rows: Array<[string, string | number]> }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #f1f1f1' }}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}
