import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currencyPHP, formatDate } from "@/lib/format";

export default async function ReceiptPrintPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await db.receipt.findUnique({ where: { id }, include: { invoice: true } });

  if (!receipt) return notFound();

  return (
    <div className="print-sheet">
      <h1>Receipt {receipt.number}</h1>
      <p>Invoice: {receipt.invoice.number}</p>
      <p>Customer: {receipt.invoice.customerName}</p>
      <p>Issued: {formatDate(receipt.issuedAt)}</p>
      <p>Amount: {currencyPHP(String(receipt.amount))}</p>
      <p>Notes: {receipt.notes || "—"}</p>
    </div>
  );
}
