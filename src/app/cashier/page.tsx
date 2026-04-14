import { db } from "@/lib/db";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartCard } from "@/components/chart-card";
import { invoiceAgingBuckets } from "@/lib/invoice";

export default async function CashierPage() {
  const [invoiceCount, receiptCount, transactionCount, openBalance, aging] = await Promise.all([
    db.invoice.count(),
    db.receipt.count(),
    db.cashierTransaction.count(),
    db.invoice.aggregate({ _sum: { balanceDue: true } }),
    invoiceAgingBuckets()
  ]);

  const data = Object.entries(aging).map(([name, value]) => ({ name, value }));

  return (
    <div className="list-stack">
      <KPIGrid
        items={[
          { label: "Invoices", value: String(invoiceCount) },
          { label: "Receipts", value: String(receiptCount) },
          { label: "Transactions", value: String(transactionCount) },
          { label: "Open Balance", value: String(Number(openBalance._sum.balanceDue || 0).toFixed(2)) }
        ]}
      />
      <ChartCard title="Aging Buckets" data={data} />
    </div>
  );
}
