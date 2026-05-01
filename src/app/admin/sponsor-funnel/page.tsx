import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type SponsorSubmission = {
  id: string;
  status?: string | null;
  companyName?: string | null;
  sponsorName?: string | null;
  interestedPackage?: string | null;
  packageName?: string | null;
  paymentMethod?: string | null;
  createdAt?: Date | string | null;
};

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

function pct(part: number, total: number) {
  if (!total) return '0.0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

async function getSponsorFunnelData() {
  if (!hasUsableDatabaseUrl()) {
    return { submissions: [] as SponsorSubmission[], error: 'Database is not configured.' };
  }

  try {
    const delegate = (prisma as any).sponsorSubmission;
    const submissions = delegate?.findMany
      ? await delegate.findMany({ orderBy: { createdAt: 'desc' }, take: 250 })
      : [];
    return { submissions: submissions as SponsorSubmission[], error: !delegate?.findMany ? 'SponsorSubmission model is unavailable.' : null };
  } catch (error) {
    console.error('[admin-sponsor-funnel]', error);
    return { submissions: [] as SponsorSubmission[], error: 'Unable to load sponsor funnel data.' };
  }
}

function countWhere(items: SponsorSubmission[], matcher: (item: SponsorSubmission) => boolean) {
  return items.filter(matcher).length;
}

function countBy(items: SponsorSubmission[], key: (item: SponsorSubmission) => string) {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const label = key(item) || 'Unknown';
    map.set(label, (map.get(label) || 0) + 1);
  });
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

export default async function SponsorFunnelPage() {
  const { submissions, error } = await getSponsorFunnelData();

  const total = submissions.length;
  const review = countWhere(submissions, (item) => String(item.status || '').includes('REVIEW'));
  const approved = countWhere(submissions, (item) => item.status === 'APPROVED');
  const paid = countWhere(submissions, (item) => ['PAID', 'APPROVED'].includes(String(item.status || '')));
  const pending = countWhere(submissions, (item) => ['PENDING', 'NEW', 'SUBMITTED'].includes(String(item.status || '')));
  const packages = countBy(submissions, (item) => item.interestedPackage || item.packageName || 'Unspecified');
  const payments = countBy(submissions, (item) => item.paymentMethod || 'Unspecified');

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, color: '#666', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12 }}>Admin / Sponsor Funnel</p>
          <h1 style={{ margin: '6px 0 0', fontSize: 36 }}>Sponsor Conversion Funnel</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/admin/revenue" style={{ fontWeight: 700 }}>Revenue</Link>
          <Link href="/admin/observability" style={{ fontWeight: 700 }}>Observability</Link>
          <Link href="/admin" style={{ fontWeight: 700 }}>Admin</Link>
        </div>
      </div>

      {error ? <div style={{ border: '1px solid #f5c2c7', background: '#fff5f5', color: '#842029', padding: 16, borderRadius: 12, marginBottom: 20 }}>{error}</div> : null}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Metric label="Submissions" value={total} />
        <Metric label="Pending" value={pending} />
        <Metric label="Under Review" value={review} />
        <Metric label="Approved/Paid" value={approved} />
        <Metric label="Conversion" value={pct(approved, total)} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18, marginBottom: 24 }}>
        <Panel title="Package Demand">
          <BarChart data={packages} emptyLabel="No package data yet." />
        </Panel>
        <Panel title="Payment Method Mix">
          <BarChart data={payments} emptyLabel="No payment data yet." />
        </Panel>
      </section>

      <Panel title="Recent Sponsor Leads">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}><th style={{ padding: 8 }}>Company</th><th style={{ padding: 8 }}>Package</th><th style={{ padding: 8 }}>Payment</th><th style={{ padding: 8 }}>Status</th></tr></thead>
            <tbody>{submissions.slice(0, 30).map((item) => <tr key={item.id} style={{ borderBottom: '1px solid #f1f1f1' }}><td style={{ padding: 8 }}>{item.companyName || item.sponsorName || 'Sponsor'}</td><td style={{ padding: 8 }}>{item.interestedPackage || item.packageName || '-'}</td><td style={{ padding: 8 }}>{item.paymentMethod || '-'}</td><td style={{ padding: 8 }}>{item.status || '-'}</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}><p style={{ margin: 0, color: '#666' }}>{label}</p><strong style={{ fontSize: 26 }}>{value}</strong></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}><h2 style={{ marginTop: 0 }}>{title}</h2>{children}</section>;
}

function BarChart({ data, emptyLabel }: { data: Array<{ label: string; value: number }>; emptyLabel: string }) {
  const max = Math.max(...data.map((item) => item.value), 0);
  if (!data.length || max <= 0) return <p style={{ color: '#666' }}>{emptyLabel}</p>;
  return <div style={{ display: 'grid', gap: 10 }}>{data.map((item) => <div key={item.label}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}><span>{item.label}</span><strong>{item.value}</strong></div><div style={{ height: 12, background: '#f3f4f6', borderRadius: 999, marginTop: 4, overflow: 'hidden' }}><div style={{ width: `${Math.max(4, Math.round((item.value / max) * 100))}%`, height: '100%', background: '#111827', borderRadius: 999 }} /></div></div>)}</div>;
}
