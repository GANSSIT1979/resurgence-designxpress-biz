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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const delegate = getRevenueDelegate();
    if (!delegate?.findUnique) {
      return NextResponse.json({ error: "Revenue monitoring model is not enabled yet." }, { status: 400 });
    }

    const { id } = await params;
    const item = await delegate.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Revenue record not found." }, { status: 404 });
    }

    return NextResponse.json({ item: serializeRevenueRecord(item) });
  } catch (error) {
    console.error("GET /api/admin/revenue-monitoring/[id] error:", error);
    return NextResponse.json({ error: "Unable to load revenue record." }, { status: 400 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const delegate = getRevenueDelegate();
    if (!delegate?.findUnique || !delegate?.update) {
      return NextResponse.json({ error: "Revenue monitoring model is not enabled yet." }, { status: 400 });
    }

    const { id } = await params;
    const before = await delegate.findUnique({ where: { id } });

    if (!before) {
      return NextResponse.json({ error: "Revenue record not found." }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid revenue payload." }, { status: 400 });
    }

    const payload = buildRevenuePayload(body);
    const item = await delegate.update({
      where: { id },
      data: payload as Record<string, unknown>,
    });

    try {
      await logActivity({
        request,
        action: "REVENUE_RECORD_UPDATED",
        resource: "revenue-record",
        resourceId: item.id,
        targetLabel: item.title,
        metadata: summarizeChanges(
          before as Record<string, unknown>,
          item as Record<string, unknown>,
          [
            "saleDate","sourceType","title","referenceNo","creatorProfileId","partnerId",
            "creatorName","partnerName","sponsorName","productCategory","merchandiseType",
            "quantity","unitPrice","grossSales","costAmount","netRevenue","sponsorshipPercent",
            "talentFeeAmount","franchiseAmount","companyShareAmount","notes","attachmentUrl"
          ]
        ),
      });
    } catch {}

    return NextResponse.json({ item: serializeRevenueRecord(item) });
  } catch (error) {
    console.error("PUT /api/admin/revenue-monitoring/[id] error:", error);
    return NextResponse.json({ error: "Unable to update revenue record." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const delegate = getRevenueDelegate();
    if (!delegate?.findUnique || !delegate?.delete) {
      return NextResponse.json({ error: "Revenue monitoring model is not enabled yet." }, { status: 400 });
    }

    const { id } = await params;
    const before = await delegate.findUnique({ where: { id } });

    if (!before) {
      return NextResponse.json({ error: "Revenue record not found." }, { status: 404 });
    }

    await delegate.delete({ where: { id } });

    try {
      await logActivity({
        request,
        action: "REVENUE_RECORD_DELETED",
        resource: "revenue-record",
        resourceId: before.id,
        targetLabel: before.title,
        metadata: { sourceType: before.sourceType, grossSales: before.grossSales },
      });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/revenue-monitoring/[id] error:", error);
    return NextResponse.json({ error: "Unable to delete revenue record." }, { status: 400 });
  }
}
