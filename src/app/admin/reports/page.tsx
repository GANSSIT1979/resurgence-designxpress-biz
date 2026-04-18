import { AdminShell } from '@/components/admin-shell';
import { AdminReportsManager } from '@/components/forms/admin-reports-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [submissions, approved, pending, inquiries, packages, creators, productServices, galleryEvents, savedReports, users, submissionStatusCounts, inquiryStatusCounts] = await Promise.all([
    prisma.sponsorSubmission.count(),
    prisma.sponsorSubmission.count({ where: { status: { in: ['APPROVED', 'CONVERTED_TO_ACTIVE_SPONSOR'] } } }),
    prisma.sponsorSubmission.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION'] } } }),
    prisma.inquiry.count(),
    prisma.sponsorPackageTemplate.count(),
    prisma.creatorProfile.count(),
    prisma.productService.count(),
    prisma.mediaEvent.count(),
    prisma.adminReport.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.user.findMany({ select: { role: true } }),
    prisma.sponsorSubmission.findMany({ select: { status: true } }),
    prisma.inquiry.findMany({ select: { status: true } }),
  ]);

  const metrics = [
    { label: 'Sponsor applications received', value: submissions },
    { label: 'Approved or converted sponsors', value: approved },
    { label: 'Pending sponsor pipeline', value: pending },
    { label: 'Public inquiries captured', value: inquiries },
    { label: 'Tier templates in CMS', value: packages },
    { label: 'Creator profiles in roster', value: creators },
    { label: 'Products & services', value: productServices },
    { label: 'Gallery events', value: galleryEvents },
  ];

  const chartGroups = [
    {
      title: 'Sponsor submission pipeline',
      items: ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'CONVERTED_TO_ACTIVE_SPONSOR', 'REJECTED'].map((status) => ({
        label: status.replaceAll('_', ' '),
        value: submissionStatusCounts.filter((item) => item.status === status).length,
      })),
    },
    {
      title: 'Inquiry status mix',
      items: ['NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUALIFIED', 'PENDING_RESPONSE', 'CLOSED', 'ARCHIVED'].map((status) => ({
        label: status.replaceAll('_', ' '),
        value: inquiryStatusCounts.filter((item) => item.status === status).length,
      })),
    },
    {
      title: 'User roles',
      items: ['SYSTEM_ADMIN', 'CASHIER', 'SPONSOR', 'STAFF', 'PARTNER'].map((role) => ({
        label: role.replaceAll('_', ' '),
        value: users.filter((item) => item.role === role).length,
      })),
    },
  ];

  return (
    <main>
      <AdminShell
        title="Reports and Analytics"
        description="Executive view of sponsor pipeline health, package readiness, creator inventory readiness, product/service catalog status, gallery content, and inquiry capture performance."
        currentPath="/admin/reports"
      >
        <AdminReportsManager
          liveTitle="System Admin Executive Snapshot"
          liveSummary="Save, print, and export a current snapshot of the 2026 sponsorship pipeline, CMS readiness, and inquiry/media activity."
          liveMetrics={metrics}
          chartGroups={chartGroups}
          initialReports={savedReports.map((item) => ({
            id: item.id,
            title: item.title,
            reportType: item.reportType,
            summary: item.summary,
            payloadJson: item.payloadJson,
            generatedByEmail: item.generatedByEmail,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </AdminShell>
    </main>
  );
}
