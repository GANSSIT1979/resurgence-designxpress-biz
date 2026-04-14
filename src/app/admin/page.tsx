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
    const [
      inquiries,
      sponsors,
      sponsorSubmissions,
      creators,
      partners,
      gallery,
    ] = await Promise.all([
      db.inquiry.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
      db.sponsor.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
      db.sponsorSubmission.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
      db.creatorProfile.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
      db.partner.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
      db.galleryMedia.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
    ]);

    return { inquiries, sponsors, sponsorSubmissions, creators, partners, gallery };
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

  const pendingSubmissions = snapshot.sponsorSubmissions.filter(
    (item) => String(item.status || "").toUpperCase() === "PENDING"
  ).length;

  const chartData = [
    { label: "Sponsors", value: snapshot.sponsors.length },
    { label: "Submissions", value: snapshot.sponsorSubmissions.length },
    { label: "Creators", value: snapshot.creators.length },
    { label: "Partners", value: snapshot.partners.length },
    { label: "Gallery", value: snapshot.gallery.length },
    { label: "Inquiries", value: snapshot.inquiries.length },
  ];

  const tabs = [
    { href: "/admin", label: "Overview", exact: true },
    { href: "/admin/sponsor-submissions", label: "Submissions", count: pendingSubmissions },
    { href: "/admin/sponsors", label: "Sponsors", count: snapshot.sponsors.length },
    { href: "/admin/creator-network", label: "Creators", count: snapshot.creators.length },
    { href: "/admin/inquiries", label: "Inquiries", count: snapshot.inquiries.length },
  ];

  return (
    <DashboardPageOrchestrator
      eyebrow="Executive Overview"
      title="Business control center"
      subtitle="Monitor sponsor growth, creator operations, inquiry flow, and content readiness across the RESURGENCE platform."
      tabs={tabs}
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
            <div className="dashboard-stat-value">{pendingSubmissions}</div>
            <div className="dashboard-stat-label">Pending submissions</div>
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
          <div className="card-title">Recent sponsor submissions</div>
          {snapshot.sponsorSubmissions.length ? (
            <div className="list-stack">
              {snapshot.sponsorSubmissions.slice(0, 5).map((item) => (
                <div key={item.id} className="list-item">
                  <div>
                    <strong style={{ display: "block", marginBottom: 6 }}>
                      {item.companyName || item.contactName || "Sponsor submission"}
                    </strong>
                    <div className="muted">{item.email || "No email provided"}</div>
                  </div>
                  <StatusBadge label={String(item.status || "Pending")} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyStatePanel
              title="No sponsor submissions yet"
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
                      <StatusBadge label={String(item.status || "New")} />
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
