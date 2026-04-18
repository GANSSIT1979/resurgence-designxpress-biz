import Link from "next/link";
import { db } from "@/lib/db";
import { CrudManager } from "@/components/crud-manager";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function AdminSponsorSubmissionsPage() {
  const rawItems = await db.sponsorApplication.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  const items = rawItems.map((item) => ({
    ...item,
    createdAt: item.createdAt?.toISOString?.() ?? String(item.createdAt ?? ""),
    updatedAt: item.updatedAt?.toISOString?.() ?? null,
  }));

  const reviewCount = rawItems.filter((item) =>
    ["NEW", "UNDER_REVIEW"].includes(String(item.status || "").toUpperCase())
  ).length;

  const approvedCount = rawItems.filter(
    (item) => String(item.status || "").toUpperCase() === "APPROVED"
  ).length;

  return (
    <DashboardPageOrchestrator
      eyebrow="Submission Review"
      title="Sponsor applications queue"
      subtitle="Review incoming sponsor applications, update statuses, and keep the approval pipeline visible."
      tabs={[
        { href: "/admin", label: "Overview" },
        {
          href: "/admin/sponsor-submissions",
          label: "Applications",
          exact: true,
          count: items.length,
        },
        { href: "/admin/gallery", label: "Gallery" },
        { href: "/admin/inquiries", label: "Inquiries" },
        { href: "/admin/settings", label: "Settings" },
      ]}
      actions={
        <Link href="/admin" className="button button-small">
          Back to Admin
        </Link>
      }
      metrics={
        <div className="grid-4">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{items.length}</div>
            <div className="dashboard-stat-label">Total applications</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{reviewCount}</div>
            <div className="dashboard-stat-label">In review</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{approvedCount}</div>
            <div className="dashboard-stat-label">Approved</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">
              <StatusBadge label={reviewCount ? "Needs Review" : "Up to Date"} />
            </div>
            <div className="dashboard-stat-label">Queue health</div>
          </div>
        </div>
      }
    >
      <CrudManager
        title="Sponsor Applications"
        subtitle="Maintain sponsor application records and update their current review state."
        endpoint="/api/sponsor-applications"
        savedViewScope="/api/sponsor-applications"
        initialItems={items}
        columns={[
          { key: "sponsorName", label: "Sponsor Name" },
          { key: "company", label: "Company" },
          { key: "contactName", label: "Contact" },
          { key: "packageInterest", label: "Package Interest" },
          { key: "status", label: "Status" },
        ]}
        fields={[
          { name: "sponsorName", label: "Sponsor Name", required: true },
          { name: "company", label: "Company" },
          { name: "contactName", label: "Contact Name", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Phone" },
          { name: "packageInterest", label: "Package Interest", required: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["NEW", "UNDER_REVIEW", "APPROVED", "DECLINED"],
          },
          { name: "message", label: "Message", type: "textarea" },
        ]}
        emptyMessage="No sponsor applications are available yet."
        statusField="status"
      />
    </DashboardPageOrchestrator>
  );
}