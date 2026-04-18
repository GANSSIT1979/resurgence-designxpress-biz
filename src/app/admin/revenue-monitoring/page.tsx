import Link from "next/link";
import { CrudManager } from "@/components/crud-manager";
import { ModuleActionToolbar } from "@/components/module-action-toolbar";
import { RevenueLiveSummary } from "@/components/revenue-live-summary";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { computeRevenueSummary, getRevenueDelegate, serializeRevenueRecord } from "@/lib/revenue-monitoring";

export const dynamic = "force-dynamic";

export default async function AdminRevenueMonitoringPage() {
  const delegate = getRevenueDelegate();
  const rawItems = delegate?.findMany
    ? await delegate.findMany({ orderBy: [{ saleDate: "desc" }, { createdAt: "desc" }] })
    : [];

  const items = rawItems.map(serializeRevenueRecord);
  const summary = computeRevenueSummary(rawItems);

  return (
    <DashboardPageOrchestrator
      eyebrow="Revenue Monitoring"
      title="Admin sales, sponsorship, talent fee, and franchise monitoring"
      subtitle="Track DTF, sublimation, merchandise, sponsorship allocations, talent fee percentage income, franchising revenue, and company share in one admin control surface."
      tabs={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/revenue-monitoring", label: "Revenue Monitoring", exact: true, count: items.length },
        { href: "/admin/sponsor-submissions", label: "Applications" },
        { href: "/admin/gallery", label: "Gallery" },
        { href: "/admin/settings", label: "Settings" },
      ]}
      actions={<Link href="/cashier/revenue-monitoring" className="button button-small">Open Cashier View</Link>}
    >
      <RevenueLiveSummary summaryEndpoint="/api/admin/revenue-monitoring/summary" initialSummary={summary} />
      <div style={{ height: 16 }} />
      <ModuleActionToolbar exportHref="/api/admin/revenue-monitoring/export" importHref="/api/admin/revenue-monitoring/import" />
      <div style={{ height: 16 }} />
      <CrudManager
        title="Revenue Monitoring"
        subtitle="Save and monitor sales, revenue, sponsorship allocations, talent fees, franchising, attachments, and related operational references."
        endpoint="/api/admin/revenue-monitoring"
        savedViewScope="/api/admin/revenue-monitoring"
        initialItems={items}
        columns={[
          { key: "saleDate", label: "Sale Date" },
          { key: "sourceType", label: "Source" },
          { key: "title", label: "Title" },
          { key: "productCategory", label: "Category" },
          { key: "grossSales", label: "Gross Sales" },
          { key: "netRevenue", label: "Net Revenue" },
          { key: "talentFeeAmount", label: "Talent Fee" },
          { key: "franchiseAmount", label: "Franchise" },
          { key: "companyShareAmount", label: "Company Share" },
        ]}
        fields={[
          { name: "saleDate", label: "Sale Date", type: "date" },
          { name: "sourceType", label: "Source Type", type: "select", options: ["DTF","SUBLIMATION","MERCHANDISE","SPONSORSHIP","TALENT_FEE","FRANCHISE","OTHER"] },
          { name: "title", label: "Title", required: true },
          { name: "referenceNo", label: "Reference No." },
          { name: "creatorProfileId", label: "Creator Profile ID" },
          { name: "partnerId", label: "Partner ID" },
          { name: "creatorName", label: "Creator Name" },
          { name: "partnerName", label: "Partner Name" },
          { name: "sponsorName", label: "Sponsor Name" },
          { name: "productCategory", label: "Product Category", type: "select", options: ["DTF","SUBLIMATION","CLOTHING","MERCHANDISE","SPONSORSHIP","FRANCHISE","OTHER"] },
          { name: "merchandiseType", label: "Merchandise Type" },
          { name: "quantity", label: "Quantity", type: "number" },
          { name: "unitPrice", label: "Unit Price", type: "number" },
          { name: "grossSales", label: "Gross Sales", type: "number", required: true },
          { name: "costAmount", label: "Cost Amount", type: "number" },
          { name: "netRevenue", label: "Net Revenue", type: "number" },
          { name: "sponsorshipPercent", label: "Sponsorship %", type: "number" },
          { name: "talentFeeAmount", label: "Talent Fee Amount", type: "number" },
          { name: "franchiseAmount", label: "Franchise Amount", type: "number" },
          { name: "companyShareAmount", label: "Company Share Amount", type: "number" },
          { name: "attachmentUrl", label: "Attachment / Monitoring Link" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        emptyMessage="No revenue monitoring records are available yet."
        statusField="sourceType"
      />
    </DashboardPageOrchestrator>
  );
}
