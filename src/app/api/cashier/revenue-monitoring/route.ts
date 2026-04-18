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
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const items = await delegate.findMany({
      orderBy: [{ saleDate: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ items: items.map(serializeRevenueRecord) });
  } catch (error) {
    console.error("GET /api/admin/revenue-monitoring error:", error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const delegate = getRevenueDelegate();
    if (!delegate?.create) {
      return NextResponse.json({ error: "Revenue monitoring model is not enabled yet." }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid revenue payload." }, { status: 400 });
    }

    const payload = buildRevenuePayload(body);
    const item = await delegate.create({ data: payload as Record<string, unknown> });

    try {
      await logActivity({
        request,
        action: "REVENUE_RECORD_CREATED",
        resource: "revenue-record",
        resourceId: item.id,
        targetLabel: item.title,
        metadata: {
          sourceType: item.sourceType,
          grossSales: item.grossSales,
          netRevenue: item.netRevenue,
        },
      });
    } catch {}

    return NextResponse.json({ item: serializeRevenueRecord(item) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/revenue-monitoring error:", error);
    return NextResponse.json({ error: "Unable to create revenue record." }, { status: 400 });
  }
}
