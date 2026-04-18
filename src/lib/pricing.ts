import { CatalogType, PricingMode } from "@prisma/client";
import { db } from "./db";

export async function resolvePrice(input: {
  productId: string;
  catalogType: CatalogType;
  pricingMode: PricingMode;
  qty: number;
  sizeLabel?: string;
}) {
  if (input.catalogType === "SUBLI") {
    const flat = await db.productFlatPrice.findUnique({
      where: {
        productId_pricingMode: {
          productId: input.productId,
          pricingMode: input.pricingMode,
        },
      },
    });

    if (!flat) {
      throw new Error("Flat price not found for selected Subli pricing mode.");
    }

    return Number(flat.amount);
  }

  if (!input.sizeLabel) {
    throw new Error("Size is required for DTF pricing.");
  }

  const tiers = await db.productTierPrice.findMany({
    where: {
      productId: input.productId,
      pricingMode: input.pricingMode,
      sizeLabel: input.sizeLabel,
    },
    orderBy: { minQty: "asc" },
  });

  const match = tiers.find((tier) => {
    const max = tier.maxQty ?? Number.MAX_SAFE_INTEGER;
    return input.qty >= tier.minQty && input.qty <= max;
  });

  if (!match) {
    throw new Error("Tier price not found for selected DTF quantity and size.");
  }

  return Number(match.amount);
}

export function computeTotals(input: {
  items: { qty: number; unitPrice: number }[];
  discount?: number;
  vatRate?: number;
}) {
  const subtotal = input.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const discount = input.discount ?? 0;
  const vatRate = input.vatRate ?? 0;
  const taxable = subtotal - discount;
  const vatAmount = taxable * (vatRate / 100);
  const total = taxable + vatAmount;

  return { subtotal, discount, vatRate, vatAmount, total };
}

export async function generateQuoteNumber() {
  const now = new Date();
  const prefix = `RSQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  const latest = await db.quote.findFirst({
    where: { quoteNumber: { startsWith: prefix } },
    orderBy: { createdAt: "desc" },
  });

  const next = latest?.quoteNumber
    ? Number(latest.quoteNumber.split("-").pop() || "0") + 1
    : 1;

  return `${prefix}-${String(next).padStart(4, "0")}`;
}