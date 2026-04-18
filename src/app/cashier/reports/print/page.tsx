import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminPrintButton } from '@/components/admin-print-button';
import { formatCurrency } from '@/lib/cashier';
import { getCashierReportSummary } from '@/lib/cashier-server';

export const dynamic = 'force-dynamic';

export default async function CashierReportsPrintPage() {
  const summary = await getCashierReportSummary();
  if (!summary) notFound();

  return (
    <main className="print-sheet">
      <div className="btn-row" style={{ marginBottom: 18 }}>
        <Link className="button-link btn-secondary" href="/cashier/reports">Back to reports</Link>
        <AdminPrintButton label="Print / Save PDF" />
      </div>

      <h1>RESURGENCE Cashier Finance Summary</h1>
      <p>Printable finance snapshot for invoices, collections, refunds, and receivables.</p>

      <div className="card-grid grid-4" style={{ marginTop: 20 }}>
        <div className="panel"><strong>{formatCurrency(summary.totals.totalInvoiced)}</strong><div className="helper">Total invoiced</div></div>
        <div className="panel"><strong>{formatCurrency(summary.totals.totalCollected)}</strong><div className="helper">Collected</div></div>
        <div className="panel"><strong>{formatCurrency(summary.totals.totalOutstanding)}</strong><div className="helper">Outstanding</div></div>
        <div className="panel"><strong>{Math.round(summary.totals.collectionRate * 100)}%</strong><div className="helper">Collection rate</div></div>
      </div>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-kicker">Aging Buckets</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bucket</th>
                <th>Invoices</th>
                <th>Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {summary.agingBuckets.map((item) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td>{item.count}</td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-kicker">Top Outstanding Accounts</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Company</th>
                <th>Status</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {summary.topOutstanding.map((item) => (
                <tr key={item.invoiceId}>
                  <td>{item.invoiceNumber}</td>
                  <td>{item.companyName}</td>
                  <td>{item.status.replaceAll('_', ' ')}</td>
                  <td>{formatCurrency(item.balanceAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

