import { CrudManager } from "@/components/crud-manager";

export default function CashierInvoicesPage() {
  return (
    <CrudManager
      title="Invoices"
      endpoint="/api/cashier/invoices"
      fields={[
        { key: "customerName", label: "Customer / Sponsor Name", type: "text", required: true },
        { key: "sponsorId", label: "Sponsor ID", type: "text" },
        { key: "issuedAt", label: "Issued Date", type: "date" },
        { key: "dueDate", label: "Due Date", type: "date" },
        { key: "totalAmount", label: "Total Amount", type: "number", required: true },
        { key: "notes", label: "Notes", type: "textarea" }
      ]}
    />
  );
}
