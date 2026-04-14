import { CrudManager } from "@/components/crud-manager";

export default function CashierTransactionsPage() {
  return (
    <CrudManager
      title="Cashier Transactions"
      endpoint="/api/cashier/transactions"
      fields={[
        { key: "invoiceId", label: "Invoice ID", type: "text", required: true },
        { key: "type", label: "Type (COLLECTION / REFUND / ADJUSTMENT)", type: "text", required: true },
        { key: "amount", label: "Amount", type: "number", required: true },
        { key: "reference", label: "Reference", type: "text" },
        { key: "notes", label: "Notes", type: "textarea" }
      ]}
    />
  );
}
