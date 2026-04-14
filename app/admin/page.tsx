import { db } from "@/lib/db";
import { KPIGrid } from "@/components/kpi-grid";
import { ChartCard } from "@/components/chart-card";

export default async function AdminDashboardPage() {
  const [
    inquiryCount,
    submissionCount,
    sponsorCount,
    creatorCount,
    invoiceCount,
    latestApplications
  ] = await Promise.all([
    db.inquiry.count(),
    db.sponsorApplication.count(),
    db.sponsor.count(),
    db.creatorProfile.count(),
    db.invoice.count(),
    db.sponsorApplication.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { sponsorName: true, status: true }
    })
  ]);

  const chartData = latestApplications.map((item, index) => ({
    name: `${index + 1}`,
    value: item.status === "APPROVED" ? 3 : item.status === "UNDER_REVIEW" ? 2 : 1
  }));

  return (
    <div className="list-stack">
      <KPIGrid
        items={[
          { label: "Inquiries", value: String(inquiryCount) },
          { label: "Sponsor Submissions", value: String(submissionCount) },
          { label: "Sponsors", value: String(sponsorCount) },
          { label: "Creators", value: String(creatorCount) },
          { label: "Invoices", value: String(invoiceCount) }
        ]}
      />
      <ChartCard title="Recent Sponsor Submission Activity" data={chartData} />
    </div>
  );
}
