import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

async function getSponsorSnapshot() {
  const user = await getCurrentUser();

  if (!user?.sponsorId) {
    return null;
  }

  try {
    const sponsor = await db.sponsor.findUnique({
      where: { id: user.sponsorId },
      include: {
        deliverables: true,
        applications: true,
        package: true,
        profile: true,
      },
    });

    return sponsor;
  } catch (error) {
    console.error("Sponsor snapshot load failed:", error);
    return null;
  }
}

export default async function SponsorDashboardPage() {
  const sponsor = await getSponsorSnapshot();

  if (!sponsor) {
    return (
      <EmptyStatePanel
        title="Sponsor account not linked yet"
        description="This sponsor login is active, but no sponsor record is currently attached to the account."
        actions={
          <Link href="/contact" className="button">
            Contact Team
          </Link>
        }
      />
    );
  }

  const tabs = [
    { href: "/sponsor/dashboard", label: "Overview", exact: true },
    { href: "/sponsor/dashboard/applications", label: "Applications", count: sponsor.applications.length },
    { href: "/sponsor/dashboard/deliverables", label: "Deliverables", count: sponsor.deliverables.length },
    { href: "/sponsor/dashboard/profile", label: "Profile" },
  ];

  const pendingDeliverables = sponsor.deliverables.filter(
    (item: any) => String(item.status || "").toUpperCase() === "PENDING"
  ).length;

  return (
    <DashboardPageOrchestrator
      eyebrow="Partner Workspace"
      title={sponsor.name || "Sponsor Dashboard"}
      subtitle="Track brand package details, partner deliverables, application history, and profile readiness in a cleaner sponsor-facing workspace."
      tabs={tabs}
      actions={
        <>
          <Link href="/sponsor/dashboard/profile" className="button button-secondary button-small">
            Update Profile
          </Link>
          <Link href="/support" className="button button-small">
            Contact Support
          </Link>
        </>
      }
      metrics={
        <div className="grid-4">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{sponsor.package?.title || "—"}</div>
            <div className="dashboard-stat-label">Package tier</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{sponsor.applications.length}</div>
            <div className="dashboard-stat-label">Applications</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{sponsor.deliverables.length}</div>
            <div className="dashboard-stat-label">Deliverables</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{pendingDeliverables}</div>
            <div className="dashboard-stat-label">Pending deliverables</div>
          </div>
        </div>
      }
    >
      <div className="grid-2">
        <section className="card">
          <div className="card-title">Sponsor profile snapshot</div>
          <div className="list-stack">
            <div className="list-item">
              <div>
                <strong style={{ display: "block", marginBottom: 6 }}>Company</strong>
                <div className="muted">{sponsor.name || "—"}</div>
              </div>
              <StatusBadge label={sponsor.profile ? "Profile Ready" : "Profile Incomplete"} />
            </div>
            <div className="list-item">
              <div>
                <strong style={{ display: "block", marginBottom: 6 }}>Package</strong>
                <div className="muted">{sponsor.package?.title || "No package assigned"}</div>
              </div>
              <StatusBadge label={sponsor.package?.status || "Active"} />
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-title">Deliverables overview</div>
          {sponsor.deliverables.length ? (
            <div className="list-stack">
              {sponsor.deliverables.slice(0, 5).map((item: any) => (
                <div key={item.id} className="list-item">
                  <div>
                    <strong style={{ display: "block", marginBottom: 6 }}>
                      {item.title || "Sponsor deliverable"}
                    </strong>
                    <div className="muted">{item.description || "No description available"}</div>
                  </div>
                  <StatusBadge label={String(item.status || "Pending")} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyStatePanel
              title="No deliverables posted yet"
              description="Your sponsorship deliverables will appear here once the RESURGENCE team publishes them."
            />
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-title">Application history</div>
        {sponsor.applications.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Package</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sponsor.applications.slice(0, 6).map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.companyName || item.contactName || "Application"}</td>
                    <td>{item.packageTitle || sponsor.package?.title || "—"}</td>
                    <td>
                      <StatusBadge label={String(item.status || "Pending")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyStatePanel
            title="No applications yet"
            description="Application records tied to this sponsor account will appear here."
          />
        )}
      </section>
    </DashboardPageOrchestrator>
  );
}
