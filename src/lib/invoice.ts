import { Decimal, InvoiceStatus, TransactionType } from "@prisma/client";
import { db } from "@/lib/db";

export async function recalculateInvoice(invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { transactions: true }
  });

  if (!invoice) throw new Error("Invoice not found");

  const collections = invoice.transactions
    .filter((t) => t.type === TransactionType.COLLECTION)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const refunds = invoice.transactions
    .filter((t) => t.type === TransactionType.REFUND)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const adjustments = invoice.transactions
    .filter((t) => t.type === TransactionType.ADJUSTMENT)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const total = Number(invoice.totalAmount);
  const balance = total - collections + refunds + adjustments;

  const status =
    balance <= 0
      ? InvoiceStatus.PAID
      : collections > 0
        ? InvoiceStatus.PARTIALLY_PAID
        : InvoiceStatus.OPEN;

  return db.invoice.update({
    where: { id: invoiceId },
    data: {
      balanceDue: new Decimal(balance),
      status
    }
  });
}

export async function invoiceAgingBuckets() {
  const invoices = await db.invoice.findMany({
    where: { status: { in: [InvoiceStatus.OPEN, InvoiceStatus.PARTIALLY_PAID] } }
  });

  const now = new Date().getTime();
  const buckets = {
    current: 0,
    "1_30": 0,
    "31_60": 0,
    "61_90": 0,
    "90_plus": 0
  };

  for (const invoice of invoices) {
    const due = invoice.dueDate ? new Date(invoice.dueDate).getTime() : now;
    const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
    const amount = Number(invoice.balanceDue);

    if (diffDays <= 0) buckets.current += amount;
    else if (diffDays <= 30) buckets["1_30"] += amount;
    else if (diffDays <= 60) buckets["31_60"] += amount;
    else if (diffDays <= 90) buckets["61_90"] += amount;
    else buckets["90_plus"] += amount;
  }

  return buckets;
}
