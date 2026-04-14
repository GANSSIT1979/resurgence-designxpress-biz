import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { currencyPHP } from "@/lib/format";
import { DashboardPageOrchestrator } from "@/components/dashboard-page-orchestrator";
import { EmptyStatePanel } from "@/components/empty-state-panel";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function SponsorBillingPage() {
  const user = await getCurrentUser();

  if (!user?.sponsorId) {
    return (
      <EmptyStatePanel
        title="Billing workspace unavailable"
        description="This sponsor login does not yet have a linked sponsor billing context."
      />
    );
  }

  const sponsor = await db.sponsor.findUnique({
    where: { id: user.sponsorId },
    include: { package: true, profile: true, invoices: true },
  });

  const invoices = sponsor?.invoices ?? [];
  const openCount = invoices.filter((item) =>
    ["OPEN", "PARTIALLY_PAID"].includes(String(item.status || "").toUpperCase())
  ).length;

  return (
    <DashboardPageOrchestrator
      eyebrow="Billing Visibility"
      title="Billing and package reference"
      subtitle="Review package assignment, sponsor contact data, and invoice visibility using the current linked finance records."
      tabs={[
        { href: "/sponsor/dashboard", label: "Overview" },
        { href: "/sponsor/dashboard/applications", label: "Applications" },
        { href: "/sponsor/dashboard/deliverables", label: "Deliverables" },
        { href: "/sponsor/dashboard/billing", label: "Billing", exact: true, count: invoices.length },
      ]}
      actions={
        <Link href="/support" className="button button-small">
          Request Billing Support
        </Link>
      }
      metrics={
        <div className="grid-3">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{sponsor?.package?.title || "—"}</div>
            <div className="dashboard-stat-label">Package tier</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{invoices.length}</div>
            <div className="dashboard-stat-label">Linked invoices</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{openCount}</div>
            <div className="dashboard-stat-label">Open invoices</div>
          </div>
        </div>
      }
    >
      <div className="grid-2">
        <section className="card">
          <div className="card-title">Package reference</div>
          <div className="list-stack">
            <div className="list-item">
              <div>
                <strong style={{ display: "block", marginBottom: 6 }}>Sponsor</strong>
                <div className="muted">{sponsor?.name || "—"}</div>
              </div>
              <StatusBadge label={sponsor?.status || "ACTIVE"} />
            </div>
            <div className="list-item">
              <div>
                <strong style={{ display: "block", marginBottom: 6 }}>Assigned package</strong>
                <div className="muted">{sponsor?.package?.title || "No package linked"}</div>
              </div>
              <StatusBadge label={sponsor?.package?.status || "ACTIVE"} />
            </div>
            <div className="list-item">
              <div>
                <strong style={{ display: "block", marginBottom: 6 }}>Billing contact</strong>
                <div className="muted">{sponsor?.profile?.contactEmail || "—"}</div>
              </div>
              <StatusBadge label={openCount ? "OPEN" : "CLEAR"} tone={openCount ? "warning" : "success"} />
            </div>
          </div>
        </section>

        {invoices.length ? (
          <section className="card">
            <div className="card-title">Invoice references</div>
            <div className="list-stack">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="list-item">
                  <div>
                    <strong style={{ display: "block", marginBottom: 6 }}>{invoice.number}</strong>
                    <div className="muted">{currencyPHP(String(invoice.balanceDue ?? 0))} balance due</div>
                  </div>
                  <StatusBadge label={String(invoice.status || "OPEN")} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <EmptyStatePanel
            title="No sponsor invoices linked yet"
            description="Billing records will appear here once invoice data is attached to this sponsor account."
            actions={<Link href="/contact" className="button button-secondary">Talk to the Team</Link>}
          />
        )}
      </div>
    </DashboardPageOrchestrator>
  );
}
