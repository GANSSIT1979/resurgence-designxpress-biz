import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function SponsorDeliverablesPage() {
  const user = await getCurrentUser();

  if (!user?.sponsorId) {
    return (
      <EmptyStatePanel
        title="Sponsor deliverables unavailable"
        description="This sponsor account does not yet have linked deliverables."
      />
    );
  }

  const sponsor = await db.sponsor.findUnique({
    where: { id: user.sponsorId },
    include: { deliverables: true },
  });

  const deliverables = sponsor?.deliverables ?? [];

  return (
    <DashboardPageOrchestrator
      eyebrow="Deliverables Tracker"
      title="Deliverables and partner commitments"
      subtitle="Track sponsor-facing tasks, activations, deadlines, and publishing progress in a clearer operational view."
      tabs={[
        { href: "/sponsor/dashboard", label: "Overview" },
        { href: "/sponsor/dashboard/applications", label: "Applications" },
        { href: "/sponsor/dashboard/deliverables", label: "Deliverables", exact: true, count: deliverables.length },
        { href: "/sponsor/dashboard/billing", label: "Billing" },
      ]}
      actions={
        <Link href="/support" className="button button-small">
          Ask About Deliverables
        </Link>
      }
      metrics={
        <div className="grid-3">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{deliverables.length}</div>
            <div className="dashboard-stat-label">Deliverables</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">
              {deliverables.filter((item) => String(item.status || "").toUpperCase() === "APPROVED").length}
            </div>
            <div className="dashboard-stat-label">Approved</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">
              {deliverables.filter((item) => String(item.status || "").toUpperCase() === "PENDING").length}
            </div>
            <div className="dashboard-stat-label">Pending</div>
          </div>
        </div>
      }
    >
      {deliverables.length ? (
        <section className="card">
          <div className="card-title">Deliverables list</div>
          <div className="list-stack">
            {deliverables.map((item) => (
              <div key={item.id} className="list-item">
                <div>
                  <strong style={{ display: "block", marginBottom: 6 }}>
                    {item.title || "Deliverable"}
                  </strong>
                  <div className="muted">{item.description || "No description provided."}</div>
                </div>
                <StatusBadge label={String(item.status || "PENDING")} />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <EmptyStatePanel
          title="No deliverables posted yet"
          description="Your deliverables will appear here once the RESURGENCE team publishes sponsor commitments for this account."
        />
      )}
    </DashboardPageOrchestrator>
  );
}
