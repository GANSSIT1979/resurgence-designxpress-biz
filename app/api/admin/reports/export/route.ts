import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireApiRole } from "@/lib/api-utils";
import { toCsv } from "@/lib/export";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN, Role.CASHIER]);
  if (auth.error) return auth.error;

  const dataset = request.nextUrl.searchParams.get("dataset") || "inquiries";
  const format = request.nextUrl.searchParams.get("format") || "json";

  const getRows = async () => {
    switch (dataset) {
      case "sponsors":
        return await db.sponsor.findMany();
      case "partners":
        return await db.partner.findMany();
      case "inquiries":
      default:
        return await db.inquiry.findMany();
    }
  };

  const rows = await getRows();

  if (format === "csv") {
    const csv = toCsv(rows as any[]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${dataset}.csv"`
      }
    });
  }

  return NextResponse.json({ items: rows });
}
