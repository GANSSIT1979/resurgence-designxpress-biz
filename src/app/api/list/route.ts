import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const quotes = await db.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return NextResponse.json({ ok: true, quotes });
}