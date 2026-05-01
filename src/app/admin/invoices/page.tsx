import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type InvoiceRow = {
  id: string;
  invoiceNumber?: string | null;
  status?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  currency?: string | null;
  subtotal?: number | string | null;
  discount?: number | string | null;
  shipping?: number | string | null;
  tax?: number | string | null;
  total?: number | string | null;
  createdAt?: Date | string | null;
  items?: Array<{ id?: string; name?: string | null; quantity?: number | string | null; unitPrice?: number | string | null; total?: number | string | null }>;
};

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

function money(value: unknown, currency = 'PHP') {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(amount);
}

async function getInvoices() {
  if (!hasUsableDatabaseUrl()) {
    return { invoices: [] as InvoiceRow[], error: 'Database is not configured. Set a valid DATABASE_URL to load invoices.' };
  }

  const invoiceDelegate = (prisma as any).invoice;
  if (!invoiceDelegate?.findMany) {
    return { invoices: [] as InvoiceRow[], error: 'Invoice Prisma model is unavailable. Regenerate Prisma client after schema sync.' };
  }

  try {
    const invoices = await invoiceDelegate.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: 100,
      include: { items: true },
    });
    return { invoices: invoices as InvoiceRow[], error: null };
  } catch (error) {
    console.error('[admin-invoices] Failed to load invoices.', error);
    return { invoices: [] as InvoiceRow[], error: 'Unable to load invoices. Check database schema and Prisma generation.' };
  }
}

export default async function AdminInvoicesPage() {
  const { invoices, error } = await getInvoices();
  const totals = invoices.reduce(
    (acc, invoice) => {
      const status = String(invoice.status || 'DRAFT');
      const total = Number(invoice.total || 0);
      acc.count += 1;
      acc.revenue += status === 'PAID' ? total : 0;
      acc.outstanding += status !== 'PAID' && status !== 'CANCELLED' ? total : 0;
      acc.byStatus[status] = (acc.byStatus[status] || 0) + 1;
      return acc;
    },
    { count: 0, revenue: 0, outstanding: 0, byStatus: {} as Record<string, number> },
  );

  return (
    <main style={{ padding: 24, maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 2, color: '#666', fontSize: 12 }}>Admin / Billing</p>
          <h1 style={{ margin: '6px 0 0', fontSize: 36 }}>Invoice Dashboard</h1>
        </div>
        <Link href="/admin" style={{ textDecoration: 'none', fontWeight: 700 }}>Back to Admin</Link>
      </div>

      {error ? (
        <div style={{ border: '1px solid #f5c2c7', background: '#fff5f5', color: '#842029', padding: 16, borderRadius: 12, marginBottom: 20 }}>
          {error}
        </div>
      ) : null}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
          <p style={{ margin: 0, color: '#666' }}>Total Invoices</p>
          <strong style={{ fontSize: 32 }}>{totals.count}</strong>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
          <p style={{ margin: 0, color: '#666' }}>Paid Revenue</p>
          <strong style={{ fontSize: 32 }}>{money(totals.revenue)}</strong>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
          <p style={{ margin: 0, color: '#666' }}>Outstanding</p>
          <strong style={{ fontSize: 32 }}>{money(totals.outstanding)}</strong>
        </div>
      </section>

      <section style={{ border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: 18, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
          <strong>Recent Invoices</strong>
          <span style={{ color: '#666' }}>{Object.entries(totals.byStatus).map(([k, v]) => `${k}: ${v}`).join(' · ')}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>Invoice</th>
                <th style={{ padding: 12 }}>Customer</th>
                <th style={{ padding: 12 }}>Status</th>
                <th style={{ padding: 12 }}>Items</th>
                <th style={{ padding: 12 }}>Subtotal</th>
                <th style={{ padding: 12 }}>Total</th>
                <th style={{ padding: 12 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length ? invoices.map((invoice) => (
                <tr key={invoice.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12, fontWeight: 700 }}>{invoice.invoiceNumber || invoice.id}</td>
                  <td style={{ padding: 12 }}>
                    <div>{invoice.customerName || 'Customer'}</div>
                    <small style={{ color: '#666' }}>{invoice.customerEmail}</small>
                  </td>
                  <td style={{ padding: 12 }}>{invoice.status || 'DRAFT'}</td>
                  <td style={{ padding: 12 }}>{invoice.items?.length || 0}</td>
                  <td style={{ padding: 12 }}>{money(invoice.subtotal, invoice.currency || 'PHP')}</td>
                  <td style={{ padding: 12, fontWeight: 800 }}>{money(invoice.total, invoice.currency || 'PHP')}</td>
                  <td style={{ padding: 12 }}>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-PH') : '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ padding: 28, textAlign: 'center', color: '#666' }}>
                    No invoices yet. Use <code>/api/invoice/paypal-create</code> to create the first PayPal invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
