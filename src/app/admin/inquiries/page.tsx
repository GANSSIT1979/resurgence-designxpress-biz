import { AdminShell } from '@/components/admin-shell';
import { InquiryStatusManager } from '@/components/forms/inquiry-status-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminInquiriesPage() {
<<<<<<< HEAD
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main>
      <AdminShell title="Inquiries" description="Review every sponsor, apparel, and event inquiry captured by the website." currentPath="/admin/inquiries">
        <InquiryStatusManager initialInquiries={inquiries.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))} />
      </AdminShell>
    </main>
=======
  const inquiries = await db.inquiry.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  const newCount = inquiries.filter((item) => String(item.status || "").toUpperCase() === "NEW").length;

  return (
    <DashboardPageOrchestrator
      eyebrow="Contact Pipeline"
      title="Inquiry management"
      subtitle="Track incoming contact requests, support messages, and business follow-up activity from one review surface."
      tabs={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/inquiries", label: "Inquiries", exact: true, count: inquiries.length },
        { href: "/admin/sponsor-submissions", label: "Applications" },
        { href: "/admin/gallery", label: "Gallery" },
      ]}
      actions={
        <Link href="/support" className="button button-small">
          Support Desk
        </Link>
      }
      metrics={
        <div className="grid-3">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{inquiries.length}</div>
            <div className="dashboard-stat-label">Inquiry records</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{newCount}</div>
            <div className="dashboard-stat-label">New inquiries</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">
              <StatusBadge label={newCount ? "Needs Response" : "Clear"} />
            </div>
            <div className="dashboard-stat-label">Response queue</div>
          </div>
        </div>
      }
    >
      <CrudManager
        title="Inquiries"
        subtitle="Update inquiry statuses and maintain follow-up visibility for contact and support workflows."
        endpoint="/api/admin/inquiries"
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "subject", label: "Subject" },
          { key: "status", label: "Status" },
        ]}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "company", label: "Company" },
          { name: "phone", label: "Phone" },
          { name: "subject", label: "Subject", required: true },
          { name: "message", label: "Message", type: "textarea", required: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["NEW", "REVIEWED", "CLOSED"],
          },
        ]}
        emptyMessage="No inquiry records are available yet."
      />
    </DashboardPageOrchestrator>
>>>>>>> parent of d975526 (commit)
  );
}
