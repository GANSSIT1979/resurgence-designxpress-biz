import { StaffInquiryManager } from '@/components/forms/staff-inquiry-manager';
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
        <RoleShell roleLabel="Staff" title="Assigned Inquiries" description="Track inquiry routing, follow-up, and status changes." navItems={[...staffNavItems]} currentPath="/staff/inquiries">
          <section className="card"><p className="section-copy">Unable to load staff session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const inquiries = await prisma.inquiry.findMany({
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
  });

  return (
    <main>
      <RoleShell roleLabel="Staff" title="Assigned Inquiries" description="Claim inquiries, update statuses, add follow-up notes, and keep sponsor outreach moving." navItems={[...staffNavItems]} currentPath="/staff/inquiries">
        <StaffInquiryManager
          initialItems={inquiries.map((item) => ({
            ...item,
            organization: item.organization ?? null,
            phone: item.phone ?? null,
            internalNotes: item.internalNotes ?? null,
            followUpAt: item.followUpAt ? item.followUpAt.toISOString() : null,
            assignedStaffProfileId: item.assignedStaffProfileId ?? null,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </RoleShell>
    </main>
  );
}
