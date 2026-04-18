import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.productCatalogItem.findMany({
      where: { isActive: true },
      include: {
        flatPrices: true,
        tierPrices: true,
      },
      orderBy: [
        { catalogType: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ ok: true, products });
  } catch {
    return NextResponse.json(
      { error: "Failed to load product catalog." },
      { status: 500 }
    );
  }
}