import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function SponsorApplicationsPage() {
  const user = await getCurrentUser();

  if (!user?.sponsorId) {
    return (
      <EmptyStatePanel
        title="Sponsor account not linked"
        description="This sponsor login does not yet have an application record attached."
        actions={<Link href="/contact" className="button">Contact Team</Link>}
      />
    );
  }

  const sponsor = await db.sponsor.findUnique({
    where: { id: user.sponsorId },
    include: { applications: true, package: true },
  });

  const applications = sponsor?.applications ?? [];
  const reviewCount = applications.filter((item) =>
    ["NEW", "UNDER_REVIEW"].includes(String(item.status || "").toUpperCase())
  ).length;

  return (
    <DashboardPageOrchestrator
      eyebrow="Partner Applications"
      title="Application history"
      subtitle="Review submitted applications, package interest, and current partner review status."
      tabs={[
        { href: "/sponsor/dashboard", label: "Overview" },
        { href: "/sponsor/dashboard/applications", label: "Applications", exact: true, count: applications.length },
        { href: "/sponsor/dashboard/deliverables", label: "Deliverables" },
        { href: "/sponsor/dashboard/billing", label: "Billing" },
      ]}
      actions={
        <Link href="/sponsor/dashboard/profile" className="button button-small">
          Update Profile
        </Link>
      }
      metrics={
        <div className="grid-3">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{applications.length}</div>
            <div className="dashboard-stat-label">Applications</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{sponsor?.package?.title || "—"}</div>
            <div className="dashboard-stat-label">Current package</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{reviewCount}</div>
            <div className="dashboard-stat-label">In review</div>
          </div>
        </div>
      }
    >
      {applications.length ? (
        <section className="card">
          <div className="card-title">Submitted applications</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Sponsor Name</th>
                  <th>Company</th>
                  <th>Package Interest</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sponsorName || "—"}</td>
                    <td>{item.company || "—"}</td>
                    <td>{item.packageInterest || sponsor?.package?.title || "—"}</td>
                    <td>
                      <StatusBadge label={String(item.status || "NEW")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyStatePanel
          title="No applications available yet"
          description="Your sponsor account will show application history here once records are linked."
        />
      )}
    </DashboardPageOrchestrator>
  );
}
