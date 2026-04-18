import { db } from "@/lib/db";

export type RevenueSummary = {
  totalGrossSales: number;
  totalNetRevenue: number;
  totalTalentFee: number;
  totalFranchiseAmount: number;
  totalCompanyShare: number;
  dtfSales: number;
  sublimationSales: number;
  merchandiseSales: number;
  sponsorshipRevenue: number;
  recordCount: number;
};

export function getRevenueDelegate() {
  return (db as unknown as {
    revenueRecord?: {
      findMany?: (args: Record<string, unknown>) => Promise<any[]>;
      findUnique?: (args: Record<string, unknown>) => Promise<any | null>;
      create?: (args: { data: Record<string, unknown> }) => Promise<any>;
      update?: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<any>;
      delete?: (args: { where: Record<string, unknown> }) => Promise<any>;
    };
  }).revenueRecord;
}

export function serializeRevenueRecord(item: any) {
  return {
    ...item,
    saleDate: item.saleDate?.toISOString?.() ?? null,
    createdAt: item.createdAt?.toISOString?.() ?? null,
    updatedAt: item.updatedAt?.toISOString?.() ?? null,
  };
}

export function asString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function asInt(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed);
}

export function asFloat(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function asDate(value: unknown) {
  if (!value || typeof value !== "string") return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildRevenuePayload(body: Record<string, unknown>) {
  const grossSales = safeNumber(body.grossSales);
  const costAmount = asFloat(body.costAmount) ?? 0;
  const netRevenue = body.netRevenue === null || body.netRevenue === undefined || body.netRevenue === ""
    ? grossSales - costAmount
    : safeNumber(body.netRevenue);

  const sponsorshipPercent = asFloat(body.sponsorshipPercent) ?? 0;
  const talentFeeAmount =
    body.talentFeeAmount === null || body.talentFeeAmount === undefined || body.talentFeeAmount === ""
      ? grossSales * (sponsorshipPercent / 100)
      : safeNumber(body.talentFeeAmount);

  const franchiseAmount = safeNumber(body.franchiseAmount);
  const companyShareAmount =
    body.companyShareAmount === null || body.companyShareAmount === undefined || body.companyShareAmount === ""
      ? netRevenue - talentFeeAmount - franchiseAmount
      : safeNumber(body.companyShareAmount);

  return {
    saleDate: asDate(body.saleDate),
    sourceType: asString(body.sourceType) || "OTHER",
    title: asString(body.title) || "Revenue Record",
    referenceNo: asString(body.referenceNo),
    creatorProfileId: asString(body.creatorProfileId),
    partnerId: asString(body.partnerId),
    creatorName: asString(body.creatorName),
    partnerName: asString(body.partnerName),
    sponsorName: asString(body.sponsorName),
    productCategory: asString(body.productCategory),
    merchandiseType: asString(body.merchandiseType),
    quantity: asInt(body.quantity),
    unitPrice: asFloat(body.unitPrice),
    grossSales,
    costAmount,
    netRevenue,
    sponsorshipPercent,
    talentFeeAmount,
    franchiseAmount,
    companyShareAmount,
    notes: asString(body.notes),
    attachmentUrl: asString(body.attachmentUrl),
  };
}

export function computeRevenueSummary(items: any[]): RevenueSummary {
  const summary: RevenueSummary = {
    totalGrossSales: 0,
    totalNetRevenue: 0,
    totalTalentFee: 0,
    totalFranchiseAmount: 0,
    totalCompanyShare: 0,
    dtfSales: 0,
    sublimationSales: 0,
    merchandiseSales: 0,
    sponsorshipRevenue: 0,
    recordCount: items.length,
  };

  for (const item of items) {
    const gross = safeNumber(item.grossSales);
    const net = safeNumber(item.netRevenue);
    const talent = safeNumber(item.talentFeeAmount);
    const franchise = safeNumber(item.franchiseAmount);
    const company = safeNumber(item.companyShareAmount);
    const source = String(item.sourceType || "").toUpperCase();

    summary.totalGrossSales += gross;
    summary.totalNetRevenue += net;
    summary.totalTalentFee += talent;
    summary.totalFranchiseAmount += franchise;
    summary.totalCompanyShare += company;

    if (source === "DTF") summary.dtfSales += gross;
    if (source === "SUBLIMATION") summary.sublimationSales += gross;
    if (source === "MERCHANDISE") summary.merchandiseSales += gross;
    if (source === "SPONSORSHIP") summary.sponsorshipRevenue += gross;
  }

  return summary;
}

export function toCsv(items: any[]) {
  const headers = [
    "saleDate","sourceType","title","referenceNo","creatorProfileId","partnerId",
    "creatorName","partnerName","sponsorName","productCategory","merchandiseType",
    "quantity","unitPrice","grossSales","costAmount","netRevenue","sponsorshipPercent",
    "talentFeeAmount","franchiseAmount","companyShareAmount","notes","attachmentUrl"
  ];

  const escapeCell = (value: unknown) => {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes("\n") || text.includes('"')) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  };

  return [
    headers.join(","),
    ...items.map((item) => headers.map((h) => escapeCell(item?.[h])).join(",")),
  ].join("\n");
}

export function parseCsvText(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length <= 1) return [];

  const splitLine = (line: string) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
        continue;
      }
      current += char;
    }

    result.push(current);
    return result.map((item) => item.trim());
  };

  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    return row;
  });
}
