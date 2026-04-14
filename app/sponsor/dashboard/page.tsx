import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { KPIGrid } from "@/components/kpi-grid";

export default async function SponsorOverviewPage() {
  const user = await getCurrentUser();
  const sponsorId = user?.sponsorId || "";

  const [applications, deliverables, invoices, profile] = await Promise.all([
    db.sponsorApplication.count({ where: { sponsorId } }),
    db.sponsorDeliverable.count({ where: { sponsorId } }),
    db.invoice.count({ where: { sponsorId } }),
    db.sponsorProfile.findUnique({ where: { sponsorId } })
  ]);

  return (
    <div className="list-stack">
      <KPIGrid
        items={[
          { label: "Applications", value: String(applications) },
          { label: "Deliverables", value: String(deliverables) },
          { label: "Invoices", value: String(invoices) },
          { label: "Profile Status", value: profile ? "Ready" : "Missing" }
        ]}
      />
      <div className="card">
        <div className="card-title">Sponsor Overview</div>
        <p className="muted">This portal is scoped to the authenticated sponsor and only loads records linked to the sponsor profile.</p>
      </div>
    </div>
  );
}
