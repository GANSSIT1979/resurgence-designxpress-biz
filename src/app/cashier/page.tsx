import Link from "next/link";
import { db } from "@/lib/db";
import { currencyPHP } from "@/lib/format";
import { ChartCard } from "@/components/chart-card";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

async function getCashierSnapshot() {
  try {
    const [invoices, receipts, transactions] = await Promise.all([
      db.invoice.findMany({ take: 100, orderBy: { createdAt: "desc" } }),
      db.receipt.findMany({ take: 100, orderBy: { createdAt: "desc" } }),
      db.cashierTransaction.findMany({ take: 100, orderBy: { createdAt: "desc" } }),
    ]);

    return { invoices, receipts, transactions };
  } catch (error) {
    console.error("Cashier snapshot load failed:", error);
    return null;
  }
}

export default async function CashierPage() {
  const snapshot = await getCashierSnapshot();

  if (!snapshot) {
    return (
      <EmptyStatePanel
        title="Cashier dashboard unavailable"
        description="The financial module could not load right now. Retry after the database connection is restored."
      />
    );
  }

  const outstanding = snapshot.invoices.reduce((sum, invoice) => {
    const balance = Number(invoice.balanceDue ?? 0);
    return sum + (Number.isFinite(balance) ? balance : 0);
  }, 0);

  const collected = snapshot.transactions
    .filter((item) => String(item.type || "").toUpperCase() === "COLLECTION")
    .reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

  const chartData = [
    { label: "Invoices", value: snapshot.invoices.length },
    { label: "Receipts", value: snapshot.receipts.length },
    { label: "Transactions", value: snapshot.transactions.length },
  ];

  return (
    <DashboardPageOrchestrator
      eyebrow="Finance Operations"
      title="Cash collections and billing visibility"
      subtitle="Track invoice movement, transaction records, receipts, and collection health from one finance-ready workspace."
      tabs={[
        { href: "/cashier", label: "Overview", exact: true },
        { href: "/cashier/invoices", label: "Invoices", count: snapshot.invoices.length },
        { href: "/cashier/receipts", label: "Receipts", count: snapshot.receipts.length },
        { href: "/cashier/reports", label: "Reports" },
      ]}
      actions={
        <>
          <Link href="/cashier/invoices" className="button button-secondary button-small">
            Open Invoices
          </Link>
          <Link href="/cashier/reports" className="button button-small">
            View Reports
          </Link>
        </>
      }
      metrics={
        <div className="grid-4">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{snapshot.invoices.length}</div>
            <div className="dashboard-stat-label">Invoices</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{snapshot.transactions.length}</div>
            <div className="dashboard-stat-label">Transactions</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{currencyPHP(collected)}</div>
            <div className="dashboard-stat-label">Collections logged</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{currencyPHP(outstanding)}</div>
            <div className="dashboard-stat-label">Outstanding balance</div>
          </div>
        </div>
      }
    >
      <div className="grid-2">
        <ChartCard
          title="Finance workload"
          subtitle="Snapshot of invoice, receipt, and transaction volume."
          data={chartData}
          type="area"
          xKey="label"
          dataKey="value"
        />

        <section className="card">
          <div className="card-title">Recent receipts</div>
          {snapshot.receipts.length ? (
            <div className="list-stack">
              {snapshot.receipts.slice(0, 5).map((receipt) => (
                <div key={receipt.id} className="list-item">
                  <div>
                    <strong style={{ display: "block", marginBottom: 6 }}>
                      {receipt.number || "Receipt"}
                    </strong>
                    <div className="muted">{currencyPHP(String(receipt.amount ?? 0))}</div>
                  </div>
                  <StatusBadge label="ISSUED" tone="success" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyStatePanel
              title="No receipts issued yet"
              description="Receipt records will appear here after cashier processing."
            />
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-title">Latest invoices</div>
        {snapshot.invoices.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.invoices.slice(0, 6).map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.number || "—"}</td>
                    <td>{invoice.customerName || "—"}</td>
                    <td>{currencyPHP(String(invoice.totalAmount ?? 0))}</td>
                    <td>
                      <StatusBadge
                        label={
                          Number(invoice.balanceDue ?? 0) > 0
                            ? `DUE ${currencyPHP(String(invoice.balanceDue ?? 0))}`
                            : "PAID"
                        }
                        tone={Number(invoice.balanceDue ?? 0) > 0 ? "warning" : "success"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyStatePanel
            title="No invoices yet"
            description="Invoice records will appear here once the cashier module starts processing billings."
          />
        )}
      </section>
    </DashboardPageOrchestrator>
  );
}
