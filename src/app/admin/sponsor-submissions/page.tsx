import { AdminShell } from '@/components/admin-shell';
import { SponsorSubmissionManager } from '@/components/forms/sponsor-submission-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

<<<<<<< HEAD
export default async function SponsorSubmissionsPage() {
  const submissions = await prisma.sponsorSubmission.findMany({
    orderBy: [{ createdAt: 'desc' }],
  });

  const initial = submissions.map((s) => ({
    id: s.id,
    companyName: s.companyName,
    contactName: s.contactName,
    email: s.email,
    phone: s.phone,
    websiteUrl: s.websiteUrl,
    category: s.category,
    interestedPackage: s.interestedPackage,
    budgetRange: s.budgetRange,
    timeline: s.timeline,
    message: s.message,
    status: s.status,
    internalNotes: s.internalNotes,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <main>
      <AdminShell
        title="Sponsor Submissions"
        description="Review sponsor applications submitted from the public website. Update status, add internal notes, and follow up with high-value prospects."
        currentPath="/admin/sponsor-submissions"
      >
        <SponsorSubmissionManager initialSubmissions={initial} />
      </AdminShell>
    </main>
=======
export default async function AdminSponsorSubmissionsPage() {
  const items = await db.sponsorApplication.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  const reviewCount = items.filter((item) =>
    ["NEW", "UNDER_REVIEW"].includes(String(item.status || "").toUpperCase())
  ).length;
  const approved = items.filter((item) => String(item.status || "").toUpperCase() === "APPROVED").length;

  return (
    <DashboardPageOrchestrator
      eyebrow="Submission Review"
      title="Sponsor applications queue"
      subtitle="Review incoming sponsor applications, update statuses, and keep the approval pipeline visible."
      tabs={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/sponsor-submissions", label: "Applications", exact: true, count: items.length },
        { href: "/admin/gallery", label: "Gallery" },
        { href: "/admin/inquiries", label: "Inquiries" },
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
            <div className="dashboard-stat-value">{approved}</div>
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
      />
    </DashboardPageOrchestrator>
>>>>>>> parent of d975526 (commit)
  );
}
