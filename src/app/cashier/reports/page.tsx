import { db } from "@/lib/db";
import { currencyPHP } from "@/lib/format";
import { ChartCard } from "@/components/chart-card";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { EmptyStatePanel } from "@/components/empty-state-panel";

export const dynamic = "force-dynamic";

export default async function CashierReportsPage() {
  const [invoices, receipts, transactions] = await Promise.all([
    db.invoice.findMany({ take: 100, orderBy: { createdAt: "desc" } }),
    db.receipt.findMany({ take: 100, orderBy: { createdAt: "desc" } }),
    db.cashierTransaction.findMany({ take: 100, orderBy: { createdAt: "desc" } }),
  ]);

  const chartData = [
    { label: "Invoices", value: invoices.length },
    { label: "Receipts", value: receipts.length },
    { label: "Transactions", value: transactions.length },
  ];

  const totalReceipts = receipts.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  const totalTransactions = transactions.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

  return (
    <DashboardPageOrchestrator
      eyebrow="Financial Reporting"
      title="Cashier reports and summary"
      subtitle="Review document volume, receipt totals, and transaction movement in a simplified reporting surface."
      tabs={[
        { href: "/cashier", label: "Overview" },
        { href: "/cashier/invoices", label: "Invoices" },
        { href: "/cashier/receipts", label: "Receipts" },
        { href: "/cashier/reports", label: "Reports", exact: true },
      ]}
      metrics={
        <div className="grid-4">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{invoices.length}</div>
            <div className="dashboard-stat-label">Invoices</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{receipts.length}</div>
            <div className="dashboard-stat-label">Receipts</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{currencyPHP(totalReceipts)}</div>
            <div className="dashboard-stat-label">Receipt total</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{currencyPHP(totalTransactions)}</div>
            <div className="dashboard-stat-label">Transaction total</div>
          </div>
        </div>
      }
    >
      {chartData.some((item) => item.value > 0) ? (
        <div className="grid-2">
          <ChartCard
            title="Finance activity summary"
            subtitle="Document and transaction volume comparison."
            data={chartData}
            xKey="label"
            dataKey="value"
            type="line"
          />

          <section className="card">
            <div className="card-title">Reporting notes</div>
            <div className="list-stack">
              <div className="list-item">
                <div>
                  <strong style={{ display: "block", marginBottom: 6 }}>Receipt total</strong>
                  <div className="muted">Total value of issued receipts in the current data set.</div>
                </div>
                <div>{currencyPHP(totalReceipts)}</div>
              </div>
              <div className="list-item">
                <div>
                  <strong style={{ display: "block", marginBottom: 6 }}>Transaction total</strong>
                  <div className="muted">Combined amount across logged cashier transactions.</div>
                </div>
                <div>{currencyPHP(totalTransactions)}</div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <EmptyStatePanel
          title="No finance data available yet"
          description="Reports will appear here once invoices, receipts, or cashier transactions are recorded."
        />
      )}
    </DashboardPageOrchestrator>
  );
}
