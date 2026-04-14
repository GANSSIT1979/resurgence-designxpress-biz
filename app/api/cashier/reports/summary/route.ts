import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireApiRole } from "@/lib/api-utils";
import { invoiceAgingBuckets } from "@/lib/invoice";
import { toCsv } from "@/lib/export";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.CASHIER, Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const [invoiceCount, receiptCount, transactionCount, sums, aging] = await Promise.all([
    db.invoice.count(),
    db.receipt.count(),
    db.cashierTransaction.count(),
    db.invoice.aggregate({
      _sum: { totalAmount: true, balanceDue: true }
    }),
    invoiceAgingBuckets()
  ]);

  const payload = {
    invoiceCount,
    receiptCount,
    transactionCount,
    totalAmount: Number(sums._sum.totalAmount || 0),
    balanceDue: Number(sums._sum.balanceDue || 0),
    aging
  };

  const format = request.nextUrl.searchParams.get("format") || "json";
  if (format === "csv") {
    const csv = toCsv([
      {
        invoiceCount,
        receiptCount,
        transactionCount,
        totalAmount: payload.totalAmount,
        balanceDue: payload.balanceDue,
        aging_current: aging.current,
        aging_1_30: aging["1_30"],
        aging_31_60: aging["31_60"],
        aging_61_90: aging["61_90"],
        aging_90_plus: aging["90_plus"]
      }
    ]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="cashier-summary.csv"'
      }
    });
  }

  return NextResponse.json(payload);
}
