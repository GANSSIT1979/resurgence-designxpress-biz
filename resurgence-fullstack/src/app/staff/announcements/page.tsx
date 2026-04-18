import { StaffAnnouncementManager } from '@/components/forms/staff-announcement-manager';
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
        <RoleShell roleLabel="Staff" title="Announcements" description="Review platform announcements and internal reminders." navItems={[...staffNavItems]} currentPath="/staff/announcements">
          <section className="card"><p className="section-copy">Unable to load staff session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const announcements = await prisma.staffAnnouncement.findMany({
    where: { staffProfileId: context.staffProfile.id },
    orderBy: [{ isPinned: 'desc' }, { publishAt: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <main>
      <RoleShell roleLabel="Staff" title="Announcements" description="Post internal reminders, operations notices, and time-sensitive updates for staff workflows." navItems={[...staffNavItems]} currentPath="/staff/announcements">
        <StaffAnnouncementManager
          initialItems={announcements.map((item) => ({
            ...item,
            publishAt: item.publishAt ? item.publishAt.toISOString() : null,
          }))}
        />
      </RoleShell>
    </main>
  );
}
