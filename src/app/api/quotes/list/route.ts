import { NextRequest, NextResponse } from "next/server";
import { CatalogType, PricingMode } from "@prisma/client";
import { db } from "@/lib/db";
import { computeTotals, generateQuoteNumber, resolvePrice } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customerName || typeof body.customerName !== "string") {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "At least one quote item is required." }, { status: 400 });
    }

    const normalizedItems = await Promise.all(
      body.items.map(async (item: any) => {
        if (!item.productId) {
          throw new Error("Product is required.");
        }

        if (!item.pricingMode) {
          throw new Error("Pricing mode is required.");
        }

        if (!item.qty || Number(item.qty) < 1) {
          throw new Error("Quantity must be at least 1.");
        }

        const unitPrice = await resolvePrice({
          productId: item.productId,
          catalogType: item.catalogType as CatalogType,
          pricingMode: item.pricingMode as PricingMode,
          qty: Number(item.qty),
          sizeLabel: item.sizeLabel,
        });

        const product = await db.productCatalogItem.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error("Product not found.");
        }

        return {
          productId: product.id,
          catalogType: item.catalogType as CatalogType,
          pricingMode: item.pricingMode as PricingMode,
          itemName:
            product.catalogType === "DTF"
              ? `${product.fabricProduct} - ${product.printType}`
              : product.name,
          description: product.description ?? null,
          sizeLabel: item.sizeLabel ?? product.sizesLabel ?? null,
          qty: Number(item.qty),
          unitPrice,
          lineTotal: Number(item.qty) * unitPrice,
        };
      })
    );

    const totals = computeTotals({
      items: normalizedItems.map((i) => ({
        qty: i.qty,
        unitPrice: i.unitPrice,
      })),
      discount: Number(body.discount || 0),
      vatRate: Number(body.vatRate || 0),
    });

    const quote = await db.quote.create({
      data: {
        quoteNumber: await generateQuoteNumber(),
        customerName: body.customerName,
        companyName: body.companyName || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        notes: body.notes || null,
        subtotal: totals.subtotal,
        discount: totals.discount,
        vatRate: totals.vatRate,
        vatAmount: totals.vatAmount,
        total: totals.total,
        items: {
          create: normalizedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ ok: true, quote });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create quote.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}