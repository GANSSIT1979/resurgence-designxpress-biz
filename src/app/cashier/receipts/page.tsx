import { CrudManager } from "@/components/crud-manager";

export default function CashierReceiptsPage() {
  return (
    <CrudManager
      title="Receipts"
      endpoint="/api/cashier/receipts"
      fields={[
        { key: "invoiceId", label: "Invoice ID", type: "text", required: true },
        { key: "amount", label: "Amount", type: "number", required: true },
        { key: "issuedAt", label: "Issued Date", type: "date" },
        { key: "notes", label: "Notes", type: "textarea" }
      ]}
    />
  );
}
