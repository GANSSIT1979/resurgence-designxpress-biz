import { NextResponse } from "next/server";
import { logActivity, summarizeChanges } from "@/lib/audit";
import {
  buildRevenuePayload,
  computeRevenueSummary,
  getRevenueDelegate,
  parseCsvText,
  serializeRevenueRecord,
  toCsv,
} from "@/lib/revenue-monitoring";

export async function GET() {
  try {
    const delegate = getRevenueDelegate();
    if (!delegate?.findMany) {
      return new Response("", {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="revenue-monitoring.csv"',
        },
      });
    }

    const items = await delegate.findMany({
      orderBy: [{ saleDate: "desc" }, { createdAt: "desc" }],
    });

    const csv = toCsv(items.map(serializeRevenueRecord));

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="revenue-monitoring.csv"',
      },
    });
  } catch (error) {
    console.error("GET /api/admin/revenue-monitoring/export error:", error);
    return NextResponse.json({ error: "Unable to export records." }, { status: 400 });
  }
}
