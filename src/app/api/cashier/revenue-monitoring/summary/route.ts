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
      return NextResponse.json({ summary: computeRevenueSummary([]) });
    }

    const items = await delegate.findMany({});
    return NextResponse.json({ summary: computeRevenueSummary(items) });
  } catch (error) {
    console.error("GET /api/admin/revenue-monitoring/summary error:", error);
    return NextResponse.json({ summary: computeRevenueSummary([]) });
  }
}
