import { AdminShell } from '@/components/admin-shell';
import { SponsorSubmissionManager } from '@/components/forms/sponsor-submission-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SponsorSubmissionsPage() {
  const submissions = await prisma.sponsorSubmission.findMany({
    orderBy: [{ createdAt: 'desc' }],
  });

  const initial = submissions.map((s) => ({
    id: s.id,
    companyName: s.companyName,
    contactName: s.contactName,
    email: s.email,
    phone: s.phone,
    websiteUrl: s.websiteUrl,
    category: s.category,
    interestedPackage: s.interestedPackage,
    budgetRange: s.budgetRange,
    timeline: s.timeline,
    message: s.message,
    status: s.status,
    internalNotes: s.internalNotes,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <main>
      <AdminShell
        title="Sponsor Submissions"
        description="Review sponsor applications submitted from the public website. Update status, add internal notes, and follow up with high-value prospects."
        currentPath="/admin/sponsor-submissions"
      >
        <SponsorSubmissionManager initialSubmissions={initial} />
      </AdminShell>
    </main>
  );
}
