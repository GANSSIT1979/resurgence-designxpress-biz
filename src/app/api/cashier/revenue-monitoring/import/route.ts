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

export async function POST(request: Request) {
  try {
    const delegate = getRevenueDelegate();
    if (!delegate?.create) {
      return NextResponse.json({ error: "Revenue monitoring model is not enabled yet." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCsvText(text);

    let imported = 0;
    for (const row of rows) {
      const payload = buildRevenuePayload(row);
      await delegate.create({ data: payload as Record<string, unknown> });
      imported++;
    }

    try {
      await logActivity({
        request,
        action: "REVENUE_RECORDS_IMPORTED",
        resource: "revenue-record",
        targetLabel: file.name,
        metadata: { imported },
      });
    } catch {}

    return NextResponse.json({ imported });
  } catch (error) {
    console.error("POST /api/admin/revenue-monitoring/import error:", error);
    return NextResponse.json({ error: "Unable to import revenue records." }, { status: 400 });
  }
}
