import Link from "next/link";
import { db } from "@/lib/db";
import { CrudManager } from "@/components/crud-manager";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";

export const dynamic = "force-dynamic";

export default async function CashierReceiptsPage() {
  const receipts = await db.receipt.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardPageOrchestrator
      eyebrow="Collections Output"
      title="Receipt management"
      subtitle="Maintain receipt issuance, amount tracking, and payment proof records within the cashier workflow."
      tabs={[
        { href: "/cashier", label: "Overview" },
        { href: "/cashier/invoices", label: "Invoices" },
        { href: "/cashier/receipts", label: "Receipts", exact: true, count: receipts.length },
        { href: "/cashier/reports", label: "Reports" },
      ]}
      actions={
        <Link href="/cashier/invoices" className="button button-small">
          Open Invoices
        </Link>
      }
      metrics={
        <div className="grid-3">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{receipts.length}</div>
            <div className="dashboard-stat-label">Receipts issued</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">
              {receipts.filter((item) => Number(item.amount ?? 0) > 0).length}
            </div>
            <div className="dashboard-stat-label">With amount logged</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">Ready</div>
            <div className="dashboard-stat-label">Operational state</div>
          </div>
        </div>
      }
    >
      <CrudManager
        title="Receipts"
        subtitle="Issue and maintain receipt references, amounts, and payment records."
        endpoint="/api/cashier/receipts"
        columns={[
          { key: "number", label: "Receipt #" },
          { key: "invoiceId", label: "Invoice Ref" },
          { key: "amount", label: "Amount" },
          { key: "issuedAt", label: "Issued At" },
        ]}
        fields={[
          { name: "number", label: "Receipt Number" },
          { name: "invoiceId", label: "Invoice ID", required: true },
          { name: "amount", label: "Amount", type: "number", required: true },
          { name: "issuedAt", label: "Issued At", type: "date" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        emptyMessage="No receipt records are available yet."
      />
    </DashboardPageOrchestrator>
  );
}
