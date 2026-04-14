import Link from "next/link";
import { db } from "@/lib/db";
import { ChartCard } from "@/components/chart-card";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { LoadingStatePanel } from "@/components/loading-state-panel";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

async function getAdminSnapshot() {
  try {
    const [inquiries, sponsors, sponsorApplications, creators, partners, gallery] = await Promise.all([
      db.inquiry.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
      db.sponsor.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
      db.sponsorApplication.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
      db.creatorProfile.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
      db.partner.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
      db.galleryMedia.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
    ]);

    return { inquiries, sponsors, sponsorApplications, creators, partners, gallery };
  } catch (error) {
    console.error("Admin snapshot load failed:", error);
    return null;
  }
}

export default async function AdminPage() {
  const snapshot = await getAdminSnapshot();

  if (!snapshot) {
    return (
      <LoadingStatePanel
        title="Loading admin workspace"
        description="Refreshing the latest sponsorship, inquiry, creator, and content records."
      />
    );
  }

  const pendingApplications = snapshot.sponsorApplications.filter((item) =>
    ["NEW", "UNDER_REVIEW"].includes(String(item.status || "").toUpperCase())
  ).length;

  const chartData = [
    { label: "Sponsors", value: snapshot.sponsors.length },
    { label: "Applications", value: snapshot.sponsorApplications.length },
    { label: "Creators", value: snapshot.creators.length },
    { label: "Partners", value: snapshot.partners.length },
    { label: "Gallery", value: snapshot.gallery.length },
    { label: "Inquiries", value: snapshot.inquiries.length },
  ];

  return (
    <DashboardPageOrchestrator
      eyebrow="Executive Overview"
      title="Business control center"
      subtitle="Monitor sponsor growth, creator operations, inquiry flow, and content readiness across the RESURGENCE platform."
      tabs={[
        { href: "/admin", label: "Overview", exact: true },
        { href: "/admin/sponsor-submissions", label: "Applications", count: pendingApplications },
        { href: "/admin/gallery", label: "Gallery", count: snapshot.gallery.length },
        { href: "/admin/inquiries", label: "Inquiries", count: snapshot.inquiries.length },
      ]}
      actions={
        <>
          <Link href="/admin/sponsor-submissions" className="button button-secondary button-small">
            Review Queue
          </Link>
          <Link href="/admin/settings" className="button button-small">
            Platform Settings
          </Link>
        </>
      }
      metrics={
        <div className="grid-4">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{snapshot.sponsors.length}</div>
            <div className="dashboard-stat-label">Active sponsors</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{pendingApplications}</div>
            <div className="dashboard-stat-label">Applications in review</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{snapshot.creators.length}</div>
            <div className="dashboard-stat-label">Creator profiles</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{snapshot.inquiries.length}</div>
            <div className="dashboard-stat-label">Recent inquiries</div>
          </div>
        </div>
      }
    >
      <div className="grid-2">
        <ChartCard
          title="Operational volume"
          subtitle="Quick comparison across the main admin modules."
          data={chartData}
          type="bar"
          xKey="label"
          dataKey="value"
        />

        <section className="card">
          <div className="card-title">Recent sponsor applications</div>
          {snapshot.sponsorApplications.length ? (
            <div className="list-stack">
              {snapshot.sponsorApplications.slice(0, 5).map((item) => (
                <div key={item.id} className="list-item">
                  <div>
                    <strong style={{ display: "block", marginBottom: 6 }}>
                      {item.sponsorName || item.contactName || "Sponsor application"}
                    </strong>
                    <div className="muted">{item.email || "No email provided"}</div>
                  </div>
                  <StatusBadge label={String(item.status || "NEW")} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyStatePanel
              title="No sponsor applications yet"
              description="Incoming sponsor applications will appear here for admin review."
            />
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-title">Latest inquiries</div>
        {snapshot.inquiries.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.inquiries.slice(0, 6).map((item) => (
                  <tr key={item.id}>
                    <td>{item.name || "—"}</td>
                    <td>{item.email || "—"}</td>
                    <td>{item.subject || "General inquiry"}</td>
                    <td>
                      <StatusBadge label={String(item.status || "NEW")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyStatePanel
            title="No inquiries yet"
            description="Contact and support inquiries will appear here once users start submitting forms."
          />
        )}
      </section>
    </DashboardPageOrchestrator>
  );
}
