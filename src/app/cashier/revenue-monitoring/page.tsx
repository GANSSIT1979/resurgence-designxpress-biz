import Link from "next/link";
import { CrudManager } from "@/components/crud-manager";
import { ModuleActionToolbar } from "@/components/module-action-toolbar";
import { RevenueLiveSummary } from "@/components/revenue-live-summary";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { computeRevenueSummary, getRevenueDelegate, serializeRevenueRecord } from "@/lib/revenue-monitoring";

export const dynamic = "force-dynamic";

export default async function CashierRevenueMonitoringPage() {
  const delegate = getRevenueDelegate();
  const rawItems = delegate?.findMany
    ? await delegate.findMany({ orderBy: [{ saleDate: "desc" }, { createdAt: "desc" }] })
    : [];

  const items = rawItems.map(serializeRevenueRecord);
  const summary = computeRevenueSummary(rawItems);

  return (
    <DashboardPageOrchestrator
      eyebrow="Cashier Revenue Monitoring"
      title="Sales and revenue operations"
      subtitle="Monitor DTF, sublimation, merchandise, sponsorship shares, talent fee allocations, franchising, and revenue references from the cashier workspace."
      tabs={[
        { href: "/cashier", label: "Overview" },
        { href: "/cashier/invoices", label: "Invoices" },
        { href: "/cashier/receipts", label: "Receipts" },
        { href: "/cashier/revenue-monitoring", label: "Revenue Monitoring", exact: true, count: items.length },
      ]}
      actions={<Link href="/admin/revenue-monitoring" className="button button-small">Open Admin View</Link>}
    >
      <RevenueLiveSummary summaryEndpoint="/api/cashier/revenue-monitoring/summary" initialSummary={summary} />
      <div style={{ height: 16 }} />
      <ModuleActionToolbar exportHref="/api/cashier/revenue-monitoring/export" importHref="/api/cashier/revenue-monitoring/import" />
      <div style={{ height: 16 }} />
      <CrudManager
        title="Cashier Revenue Monitoring"
        subtitle="Capture and save sales-linked records, revenue allocations, sponsorship splits, talent fees, and franchising figures."
        endpoint="/api/cashier/revenue-monitoring"
        savedViewScope="/api/cashier/revenue-monitoring"
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
        emptyMessage="No cashier revenue records are available yet."
        statusField="sourceType"
      />
    </DashboardPageOrchestrator>
  );
}
