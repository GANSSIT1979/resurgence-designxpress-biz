import Link from "next/link";
import { db } from "@/lib/db";
import { CrudManager } from "@/components/crud-manager";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";

export const dynamic = "force-dynamic";

export default async function CashierInvoicesPage() {
  const invoices = await db.invoice.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardPageOrchestrator
      eyebrow="Billing Documents"
      title="Invoice management"
      subtitle="Create, edit, and review invoice records using the same premium financial workflow as the main cashier dashboard."
      tabs={[
        { href: "/cashier", label: "Overview" },
        { href: "/cashier/invoices", label: "Invoices", exact: true, count: invoices.length },
        { href: "/cashier/receipts", label: "Receipts" },
        { href: "/cashier/reports", label: "Reports" },
      ]}
      actions={
        <Link href="/cashier/reports" className="button button-secondary button-small">
          Finance Reports
        </Link>
      }
      metrics={
        <div className="grid-3">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{invoices.length}</div>
            <div className="dashboard-stat-label">Invoices</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">
              {invoices.filter((item) => Number(item.balanceDue ?? 0) > 0).length}
            </div>
            <div className="dashboard-stat-label">With balance due</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">
              {invoices.filter((item) => Number(item.balanceDue ?? 0) <= 0).length}
            </div>
            <div className="dashboard-stat-label">Paid/cleared</div>
          </div>
        </div>
      }
    >
      <CrudManager
        title="Invoices"
        subtitle="Create and maintain invoice documents, total values, balance visibility, and status references."
        endpoint="/api/cashier/invoices"
        columns={[
          { key: "number", label: "Invoice #" },
          { key: "customerName", label: "Customer" },
          { key: "totalAmount", label: "Total" },
          { key: "balanceDue", label: "Balance Due" },
        ]}
        fields={[
          { name: "number", label: "Invoice Number" },
          { name: "customerName", label: "Customer Name", required: true },
          { name: "sponsorId", label: "Sponsor ID" },
          { name: "totalAmount", label: "Total Amount", type: "number", required: true },
          { name: "balanceDue", label: "Balance Due", type: "number" },
          { name: "issuedAt", label: "Issued At", type: "date" },
          { name: "dueDate", label: "Due Date", type: "date" },
          { name: "status", label: "Status", type: "select", options: ["DRAFT", "OPEN", "PARTIALLY_PAID", "PAID", "VOID"] },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        emptyMessage="No invoice records are available yet."
      />
    </DashboardPageOrchestrator>
  );
}
