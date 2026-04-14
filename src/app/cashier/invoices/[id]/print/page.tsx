import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currencyPHP, formatDate } from "@/lib/format";

export default async function InvoicePrintPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await db.invoice.findUnique({ where: { id } });

  if (!invoice) return notFound();

  return (
    <div className="print-sheet">
      <h1>Invoice {invoice.number}</h1>
      <p>Customer: {invoice.customerName}</p>
      <p>Issued: {formatDate(invoice.issuedAt)}</p>
      <p>Due: {formatDate(invoice.dueDate)}</p>
      <p>Total: {currencyPHP(String(invoice.totalAmount))}</p>
      <p>Balance: {currencyPHP(String(invoice.balanceDue))}</p>
      <p>Status: {invoice.status}</p>
      <p>Notes: {invoice.notes || "—"}</p>
    </div>
  );
}
