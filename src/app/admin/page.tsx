<<<<<<< HEAD
import { AdminShell } from '@/components/admin-shell';
import { NotificationCenter } from '@/components/notification-center';
import { getAutomationInbox } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import { sponsorshipStats } from '@/lib/resurgence';
import { getCurrentSessionUser } from '@/lib/session-server';
=======
import Link from "next/link";
import { db } from "@/lib/db";
import { ChartCard } from "@/components/chart-card";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { LoadingStatePanel } from "@/components/loading-state-panel";
import { StatusBadge } from "@/components/status-badge";
>>>>>>> parent of d975526 (commit)

export const dynamic = 'force-dynamic';

<<<<<<< HEAD
export default async function AdminDashboardPage() {
  const sessionContext = await getCurrentSessionUser();
  const [
    sponsorCount,
    partnerCount,
    inquiryCount,
    openInquiries,
    submissionCount,
    pendingSubmissions,
    contentCount,
    creatorCount,
    inventoryCount,
    templateCount,
    userCount,
    galleryEventCount,
    productServiceCount,
    reportCount,
    shopProductCount,
    shopOrderCount,
    inbox,
  ] = await Promise.all([
    prisma.sponsor.count(),
    prisma.partner.count(),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: { in: ['NEW', 'UNDER_REVIEW', 'PENDING_RESPONSE'] } } }),
    prisma.sponsorSubmission.count(),
    prisma.sponsorSubmission.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION'] } } }),
    prisma.pageContent.count(),
    prisma.creatorProfile.count(),
    prisma.sponsorInventoryCategory.count(),
    prisma.sponsorPackageTemplate.count(),
    prisma.user.count(),
    prisma.mediaEvent.count(),
    prisma.productService.count(),
    prisma.adminReport.count(),
    prisma.shopProduct.count(),
    prisma.shopOrder.count(),
    sessionContext ? getAutomationInbox(sessionContext.user.role, sessionContext.user.id, 6) : Promise.resolve({ notifications: [], emails: [] }),
  ]);

  return (
    <main>
      <AdminShell
        title="2026 Sponsorship Operations Overview"
        description="Monitor the entire RESURGENCE sponsorship engine, keep the CMS aligned with the proposal deck, and manage the full role-based platform from one place."
        currentPath="/admin"
      >
        <div className="card-grid grid-4">
          <div className="panel"><strong>{userCount}</strong><div className="helper">Total users</div></div>
          <div className="panel"><strong>{sponsorCount}</strong><div className="helper">Sponsor packages / records</div></div>
          <div className="panel"><strong>{creatorCount}</strong><div className="helper">Creator profiles</div></div>
          <div className="panel"><strong>{inventoryCount}</strong><div className="helper">Inventory categories</div></div>
          <div className="panel"><strong>{templateCount}</strong><div className="helper">Package templates</div></div>
          <div className="panel"><strong>{galleryEventCount}</strong><div className="helper">Gallery events</div></div>
          <div className="panel"><strong>{productServiceCount}</strong><div className="helper">Products & services</div></div>
          <div className="panel"><strong>{reportCount}</strong><div className="helper">Saved admin reports</div></div>
          <div className="panel"><strong>{shopProductCount}</strong><div className="helper">Shop products</div></div>
          <div className="panel"><strong>{shopOrderCount}</strong><div className="helper">Shop orders</div></div>
          <div className="panel"><strong>{submissionCount}</strong><div className="helper">Sponsor submissions</div></div>
          <div className="panel"><strong>{pendingSubmissions}</strong><div className="helper">Pending sponsor reviews</div></div>
          <div className="panel"><strong>{openInquiries}</strong><div className="helper">Open inquiries</div></div>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Sponsorship Positioning</div>
            <h2 style={{ marginTop: 0 }}>Deck-aligned business summary</h2>
            <div className="card-grid grid-3" style={{ marginTop: 18 }}>
              <div className="panel"><strong>{sponsorshipStats.combinedFollowers}</strong><div className="helper">Combined followers</div></div>
              <div className="panel"><strong>{sponsorshipStats.activePlatforms}</strong><div className="helper">Active platforms</div></div>
              <div className="panel"><strong>{sponsorshipStats.creatorCount}</strong><div className="helper">High-engagement creators</div></div>
            </div>
            <p className="section-copy" style={{ marginTop: 18 }}>
              The admin CMS now governs creator network content, sponsor inventory sections, tier-based package templates, sponsor-facing wording, and fresh-install fallback readiness.
            </p>
          </section>

          <section className="card">
            <div className="section-kicker">Content Readiness</div>
            <h2 style={{ marginTop: 0 }}>Live site and seeded deck structure are aligned.</h2>
            <p className="section-copy">
              Public pages pull sponsor content, creator content, sponsor inventory, and CMS sections from the database so fresh installs immediately reflect the 2026 sponsorship proposal.
            </p>
            <div className="panel" style={{ marginTop: 16 }}>
              <strong>{contentCount}</strong>
              <div className="helper">Editable CMS sections</div>
            </div>
            <div className="panel" style={{ marginTop: 16 }}>
              <strong>{partnerCount}</strong>
              <div className="helper">Partners tracked in the platform</div>
            </div>
            <div className="panel" style={{ marginTop: 16 }}>
              <strong>{inquiryCount}</strong>
              <div className="helper">Total inquiries captured from the public site</div>
            </div>
          </section>
        </div>

        <div style={{ marginTop: 20 }}>
          <NotificationCenter
            title="Executive workflow inbox"
            notifications={inbox.notifications}
            emails={inbox.emails}
          />
        </div>
      </AdminShell>
    </main>
=======
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
>>>>>>> parent of d975526 (commit)
  );
}
