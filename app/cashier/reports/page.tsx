import { DataTable } from "@/components/data-table";
import { invoiceAgingBuckets } from "@/lib/invoice";

export default async function CashierReportsPage() {
  const aging = await invoiceAgingBuckets();

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-title">Aging Buckets</div>
        <DataTable
          columns={[
            { key: "bucket", label: "Bucket" },
            { key: "amount", label: "Amount" }
          ]}
          rows={Object.entries(aging).map(([bucket, amount]) => ({ bucket, amount }))}
        />
      </div>
      <div className="card">
        <div className="card-title">Exports</div>
        <div className="list-stack">
          <a className="button" href="/api/cashier/reports/summary?format=json">Summary JSON</a>
          <a className="button button-secondary" href="/api/cashier/reports/summary?format=csv">Summary CSV</a>
        </div>
      </div>
    </div>
  );
}
