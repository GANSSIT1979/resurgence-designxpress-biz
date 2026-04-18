import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [sponsors, applications, creators, inquiries, users] = await Promise.all([
    db.sponsor.findMany({ where: { status: "ACTIVE" } }),
    db.sponsorApplication.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.creatorProfile.findMany({ orderBy: { fullName: "asc" } }),
    db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.user.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const reviewCount = applications.filter(
    (item) => item.status === "UNDER_REVIEW" || item.status === "PENDING",
  ).length;

  const userRoleCounts = {
    admin: users.filter((item) => item.role === "SYSTEM_ADMIN").length,
    creator: users.filter((item) => item.role === "CREATOR").length,
    sponsor: users.filter((item) => item.role === "SPONSOR").length,
    staff: users.filter((item) => item.role === "STAFF").length,
  };

  return (
    <div className="dashboard-content-stack">
      <section className="dashboard-hero-card">
        <div>
          <div className="eyebrow">Dashboard Workspace</div>
          <h1 className="dashboard-page-title">System Admin Dashboard</h1>
          <p className="dashboard-page-subtitle">
            Oversee sponsorship operations, content modules, creator assets, inquiry flow,
            user access, and business workflows from one command surface.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <Link href="/support" className="button button-secondary button-small">
            Support
          </Link>
          <Link href="/contact" className="button button-small">
            Contact Team
          </Link>
        </div>
      </section>

      <section className="dashboard-surface">
        <div className="eyebrow">Executive Overview</div>
        <h2 className="dashboard-section-title">Business control center</h2>
        <p className="dashboard-section-subtitle">
          Monitor sponsor growth, creator operations, inquiry flow, user roles, and content readiness
          across the RESURGENCE platform.
        </p>

        <div className="inline-actions" style={{ justifyContent: "flex-end", marginBottom: 14 }}>
          <Link href="/admin/sponsor-submissions" className="button button-secondary button-small">
            Review Queue
          </Link>
          <Link href="/admin/settings" className="button button-small">
            Platform Settings
          </Link>
        </div>

        <div className="inline-actions" style={{ marginBottom: 18 }}>
          <Link href="/admin" className="button button-secondary button-small">Overview</Link>
          <Link href="/admin/sponsor-submissions" className="button button-secondary button-small">
            Applications {reviewCount ? `(${reviewCount})` : ""}
          </Link>
          <Link href="/admin/gallery" className="button button-secondary button-small">
            Gallery ({creators.length})
          </Link>
          <Link href="/admin/inquiries" className="button button-secondary button-small">
            Inquiries ({inquiries.length})
          </Link>
          <Link href="/admin/users" className="button button-small">
            Users ({users.length})
          </Link>
          <Link href="/admin/settings" className="button button-secondary button-small">
            Settings
          </Link>
        </div>

        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="kpi-value">{sponsors.length}</div>
            <div className="muted">Active sponsors</div>
          </div>
          <div className="card">
            <div className="kpi-value">{reviewCount}</div>
            <div className="muted">Applications in review</div>
          </div>
          <div className="card">
            <div className="kpi-value">{creators.length}</div>
            <div className="muted">Creator profiles</div>
          </div>
          <div className="card">
            <div className="kpi-value">{users.length}</div>
            <div className="muted">Platform users</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">Operational modules</div>
            <p className="muted">Jump directly into the highest-priority admin modules.</p>
            <div className="list-stack">
              <Link href="/admin/sponsor-submissions" className="list-item">
                <div>
                  <strong>Sponsor Applications</strong>
                  <div className="muted">Review and approve incoming sponsorship requests.</div>
                </div>
                <span className="status-pill">{reviewCount} open</span>
              </Link>

              <Link href="/admin/gallery" className="list-item">
                <div>
                  <strong>Gallery</strong>
                  <div className="muted">Maintain media assets and event-backed visual content.</div>
                </div>
                <span className="status-pill">{creators.length} creator assets</span>
              </Link>

              <Link href="/admin/inquiries" className="list-item">
                <div>
                  <strong>Inquiries</strong>
                  <div className="muted">Track public contact submissions and support readiness.</div>
                </div>
                <span className="status-pill">{inquiries.length} recent</span>
              </Link>

              <Link href="/admin/users" className="list-item">
                <div>
                  <strong>Users & Roles</strong>
                  <div className="muted">Create, edit, delete, and manage role-based access.</div>
                </div>
                <span className="status-pill">{users.length} users</span>
              </Link>

              <Link href="/admin/settings" className="list-item">
                <div>
                  <strong>Platform Settings</strong>
                  <div className="muted">Control public-facing defaults and operational settings.</div>
                </div>
                <span className="status-pill">Configured</span>
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-title">User role distribution</div>
            <p className="muted">Keep user creation and permissions visible from the main admin dashboard.</p>

            <div className="grid-2">
              <div className="card" style={{ padding: 18 }}>
                <div className="kpi-value">{userRoleCounts.admin}</div>
                <div className="muted">System Admin</div>
              </div>
              <div className="card" style={{ padding: 18 }}>
                <div className="kpi-value">{userRoleCounts.creator}</div>
                <div className="muted">Creators</div>
              </div>
              <div className="card" style={{ padding: 18 }}>
                <div className="kpi-value">{userRoleCounts.sponsor}</div>
                <div className="muted">Sponsors</div>
              </div>
              <div className="card" style={{ padding: 18 }}>
                <div className="kpi-value">{userRoleCounts.staff}</div>
                <div className="muted">Staff</div>
              </div>
            </div>

            <div className="inline-actions" style={{ marginTop: 18 }}>
              <Link href="/admin/users" className="button button-small">
                Open Users Module
              </Link>
              <Link href="/admin/creator-network" className="button button-secondary button-small">
                Creator Network
              </Link>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="card">
            <div className="card-title">Recent sponsor applications</div>
            {applications.length ? (
              <div className="list-stack">
                {applications.slice(0, 5).map((item) => (
                  <div key={item.id} className="list-item">
                    <div>
                      <strong>{item.sponsorName}</strong>
                      <div className="muted">{item.email}</div>
                    </div>
                    <span className="status-pill">{item.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No sponsor applications yet.</div>
            )}
          </div>

          <div className="card">
            <div className="card-title">Recent inquiries</div>
            {inquiries.length ? (
              <div className="list-stack">
                {inquiries.slice(0, 5).map((item) => (
                  <div key={item.id} className="list-item">
                    <div>
                      <strong>{item.subject || item.name}</strong>
                      <div className="muted">{item.email}</div>
                    </div>
                    <span className="status-pill">{item.status || "NEW"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No inquiries yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
