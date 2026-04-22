import { NotificationCenter } from '@/components/notification-center';
import { getAutomationInbox } from '@/lib/notifications';
import { RoleShell } from '@/components/role-shell';
import { prisma } from '@/lib/prisma';
import { getCurrentStaffContext } from '@/lib/staff-server';
import { staffNavItems } from '@/lib/staff';

export const dynamic = 'force-dynamic';

export default async function StaffDashboardPage() {
  const context = await getCurrentStaffContext();

  if (!context) {
    return (
      <main>
        <RoleShell
          roleLabel="Staff"
          title="Operations and Coordination Overview"
          description="Track assigned inquiries, sponsor follow-ups, coordination tasks, and internal operations visibility."
          navItems={[...staffNavItems]}
          currentPath="/staff"
        >
          <section className="card">
            <p className="section-copy">Unable to load staff session.</p>
          </section>
        </RoleShell>
      </main>
    );
  }

  const [
    assignedInquiries,
    openInquiries,
    taskCount,
    openTaskCount,
    scheduleCount,
    announcementCount,
  ] = await Promise.all([
    prisma.inquiry.count({ where: { assignedStaffProfileId: context.staffProfile.id } }),
    prisma.inquiry.count({
      where: {
        OR: [
          { assignedStaffProfileId: context.staffProfile.id },
          {
            assignedStaffProfileId: null,
            status: { in: ['NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUALIFIED', 'PENDING_RESPONSE'] },
          },
        ],
      },
    }),
    prisma.staffTask.count({ where: { staffProfileId: context.staffProfile.id } }),
    prisma.staffTask.count({ where: { staffProfileId: context.staffProfile.id, status: { in: ['TODO', 'IN_PROGRESS', 'BLOCKED'] } } }),
    prisma.staffScheduleItem.count({ where: { staffProfileId: context.staffProfile.id } }),
    prisma.staffAnnouncement.count({ where: { staffProfileId: context.staffProfile.id } }),
  ]);
  const inbox = await getAutomationInbox(context.user.role, context.user.id, 6);

  return (
    <main>
      <RoleShell
        roleLabel="Staff"
        title="Operations and Coordination Overview"
        description={`Manage the live coordination queue for ${context.user.displayName}.`}
        navItems={[...staffNavItems]}
        currentPath="/staff"
      >
        <div className="card-grid grid-4">
          <div className="panel"><strong>{openInquiries}</strong><div className="helper">Visible inquiries</div></div>
          <div className="panel"><strong>{assignedInquiries}</strong><div className="helper">Assigned to you</div></div>
          <div className="panel"><strong>{taskCount}</strong><div className="helper">Tasks created</div></div>
          <div className="panel"><strong>{openTaskCount}</strong><div className="helper">Open tasks</div></div>
          <div className="panel"><strong>{scheduleCount}</strong><div className="helper">Schedule items</div></div>
          <div className="panel"><strong>{announcementCount}</strong><div className="helper">Announcements posted</div></div>
          <div className="panel"><strong>{context.staffProfile.department}</strong><div className="helper">Department</div></div>
          <div className="panel"><strong>{context.staffProfile.bio ? 'Ready' : 'Pending'}</strong><div className="helper">Profile status</div></div>
        </div>

        <div style={{ marginTop: 20 }}>
          <NotificationCenter
            title="Operations inbox"
            notifications={inbox.notifications}
            emails={inbox.emails}
            degradedMessage={inbox.degradedReason ?? null}
          />
        </div>
      </RoleShell>
    </main>
  );
}
