import { StaffTaskManager } from '@/components/forms/staff-task-manager';
import { RoleShell } from '@/components/role-shell';
import { prisma } from '@/lib/prisma';
import { getCurrentStaffContext } from '@/lib/staff-server';
import { staffNavItems } from '@/lib/staff';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const context = await getCurrentStaffContext();

  if (!context) {
    return (
      <main>
        <RoleShell roleLabel="Staff" title="Tasks" description="Manage internal tasks and sponsor coordination work." navItems={[...staffNavItems]} currentPath="/staff/tasks">
          <section className="card"><p className="section-copy">Unable to load staff session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const [tasks, inquiries, submissions] = await Promise.all([
    prisma.staffTask.findMany({
      where: { staffProfileId: context.staffProfile.id },
      include: { inquiry: true, sponsorSubmission: true },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.inquiry.findMany({
      where: {
        OR: [
          { assignedStaffProfileId: context.staffProfile.id },
          {
            assignedStaffProfileId: null,
            status: { in: ['NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUALIFIED', 'PENDING_RESPONSE'] },
          },
        ],
      },
      orderBy: [{ createdAt: 'desc' }],
    }),
    prisma.sponsorSubmission.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION', 'APPROVED'] } },
      orderBy: [{ createdAt: 'desc' }],
    }),
  ]);

  return (
    <main>
      <RoleShell roleLabel="Staff" title="Tasks" description="Create and track operational tasks tied to inquiries, sponsor submissions, and internal coordination work." navItems={[...staffNavItems]} currentPath="/staff/tasks">
        <StaffTaskManager
          initialItems={tasks.map((item) => ({
            ...item,
            description: item.description ?? null,
            dueDate: item.dueDate ? item.dueDate.toISOString() : null,
            completedAt: item.completedAt ? item.completedAt.toISOString() : null,
            inquiryId: item.inquiryId ?? null,
            sponsorSubmissionId: item.sponsorSubmissionId ?? null,
            inquiry: item.inquiry
              ? {
                  id: item.inquiry.id,
                  name: item.inquiry.name,
                  organization: item.inquiry.organization ?? null,
                  inquiryType: item.inquiry.inquiryType,
                }
              : null,
            sponsorSubmission: item.sponsorSubmission
              ? {
                  id: item.sponsorSubmission.id,
                  companyName: item.sponsorSubmission.companyName,
                  interestedPackage: item.sponsorSubmission.interestedPackage,
                }
              : null,
          }))}
          inquiryOptions={inquiries.map((item) => ({
            id: item.id,
            label: `${item.name} - ${item.inquiryType}`,
          }))}
          submissionOptions={submissions.map((item) => ({
            id: item.id,
            label: `${item.companyName} - ${item.interestedPackage}`,
          }))}
        />
      </RoleShell>
    </main>
  );
}
