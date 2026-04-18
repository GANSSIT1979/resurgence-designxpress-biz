import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const [invoices, receipts, transactions] = await Promise.all([
    db.invoice.findMany(),
    db.receipt.findMany(),
    db.cashierTransaction.findMany(),
  ]);

  const outstanding = invoices.reduce((sum, item) => sum + Number(item.balanceDue ?? 0), 0);
  const receiptTotal = receipts.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  const transactionTotal = transactions.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

  return ok({
    item: {
      invoiceCount: invoices.length,
      receiptCount: receipts.length,
      transactionCount: transactions.length,
      outstanding,
      receiptTotal,
      transactionTotal,
    },
  });
}
