import { AdminPrintButton } from '@/components/admin-print-button';
import { MetricBarChart } from '@/components/metric-bar-chart';
import { RoleShell } from '@/components/role-shell';
import { cashierNavItems, formatCurrency, formatDate } from '@/lib/cashier';
import { getCashierReportSummary } from '@/lib/cashier-server';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const summary = await getCashierReportSummary();

  return (
    <main>
      <RoleShell
        roleLabel="Cashier"
        title="Finance Reports"
        description="Review sponsor billing performance, aging, payment mix, and collection efficiency across all finance records."
        navItems={cashierNavItems as any}
        currentPath="/cashier/reports"
      >
        <section className="card">
          <div className="section-kicker">Exports and Print</div>
          <div className="btn-row">
            <a className="button-link btn-secondary" href="/api/cashier/reports/export?dataset=summary&format=csv">Export Summary CSV</a>
            <a className="button-link btn-secondary" href="/api/cashier/reports/export?dataset=summary&format=json">Export Summary JSON</a>
            <a className="button-link btn-secondary" href="/api/cashier/reports/export?dataset=invoices&format=csv">Export Invoices CSV</a>
            <a className="button-link btn-secondary" href="/api/cashier/reports/export?dataset=transactions&format=csv">Export Transactions CSV</a>
            <a className="button-link btn-secondary" href="/api/cashier/reports/export?dataset=receipts&format=csv">Export Receipts CSV</a>
            <a className="button-link btn-secondary" href="/cashier/reports/print">Open Print View</a>
            <AdminPrintButton label="Print This Page" />
          </div>
        </section>

        <div className="card-grid grid-4" style={{ marginTop: 20 }}>
          <div className="panel"><strong>{formatCurrency(summary.totals.totalInvoiced)}</strong><div className="helper">Total invoiced value</div></div>
          <div className="panel"><strong>{formatCurrency(summary.totals.totalCollected)}</strong><div className="helper">Total collected</div></div>
          <div className="panel"><strong>{formatCurrency(summary.totals.totalOutstanding)}</strong><div className="helper">Outstanding receivables</div></div>
          <div className="panel"><strong>{formatCurrency(summary.totals.totalRefunded)}</strong><div className="helper">Refunds processed</div></div>
          <div className="panel"><strong>{formatCurrency(summary.totals.totalAdjustments)}</strong><div className="helper">Adjustments recorded</div></div>
          <div className="panel"><strong>{Math.round(summary.totals.collectionRate * 100)}%</strong><div className="helper">Collection rate</div></div>
          <div className="panel"><strong>{formatCurrency(summary.totals.averageInvoiceValue)}</strong><div className="helper">Average invoice value</div></div>
          <div className="panel"><strong>{summary.totals.receiptCount}</strong><div className="helper">Receipts issued</div></div>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <MetricBarChart
            title="Invoice status breakdown"
            items={summary.statusBreakdown.map((item) => ({
              label: item.status.replaceAll('_', ' '),
              value: item.outstanding,
              helper: `${item.count} invoices`,
            }))}
            valueFormatter={formatCurrency}
          />
          <MetricBarChart
            title="Collected by payment method"
            items={summary.paymentMethodBreakdown.map((item) => ({
              label: item.method.replaceAll('_', ' '),
              value: item.amount,
              helper: `${item.count} transactions`,
            }))}
            valueFormatter={formatCurrency}
          />
          <MetricBarChart
            title="Receivable aging"
            items={summary.agingBuckets.map((item) => ({
              label: item.label,
              value: item.total,
              helper: `${item.count} invoices`,
            }))}
            valueFormatter={formatCurrency}
          />
          <MetricBarChart
            title="Transaction mix"
            items={summary.transactionMix.map((item) => ({
              label: item.kind.replaceAll('_', ' '),
              value: item.amount,
              helper: `${item.count} records`,
            }))}
            valueFormatter={formatCurrency}
          />
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Monthly Trend</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Invoiced</th>
                    <th>Collected</th>
                    <th>Refunded</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.monthlyTrend.map((item) => (
                    <tr key={item.key}>
                      <td>{item.label}</td>
                      <td>{formatCurrency(item.invoiced)}</td>
                      <td>{formatCurrency(item.collected)}</td>
                      <td>{formatCurrency(item.refunded)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <div className="section-kicker">Top Outstanding Accounts</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Company</th>
                    <th>Balance</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topOutstanding.map((item) => (
                    <tr key={item.invoiceId}>
                      <td>{item.invoiceNumber}<div className="helper">{item.status.replaceAll('_', ' ')}</div></td>
                      <td>{item.companyName}</td>
                      <td>{formatCurrency(item.balanceAmount)}</td>
                      <td>{formatDate(item.dueDate)}</td>
                    </tr>
                  ))}
                  {!summary.topOutstanding.length ? <tr><td colSpan={4}><span className="helper">No outstanding invoices.</span></td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </RoleShell>
    </main>
  );
}
