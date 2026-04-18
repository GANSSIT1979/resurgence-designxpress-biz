import { StaffScheduleManager } from '@/components/forms/staff-schedule-manager';
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
        <RoleShell roleLabel="Staff" title="Schedule" description="Coordinate sponsor meetings, reviews, and internal milestones." navItems={[...staffNavItems]} currentPath="/staff/schedule">
          <section className="card"><p className="section-copy">Unable to load staff session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const scheduleItems = await prisma.staffScheduleItem.findMany({
    where: { staffProfileId: context.staffProfile.id },
    orderBy: [{ startAt: 'asc' }],
  });

  return (
    <main>
      <RoleShell roleLabel="Staff" title="Schedule" description="Plan sponsor meetings, internal reviews, and field operations with a staff-owned schedule board." navItems={[...staffNavItems]} currentPath="/staff/schedule">
        <StaffScheduleManager
          initialItems={scheduleItems.map((item) => ({
            ...item,
            location: item.location ?? null,
            startAt: item.startAt.toISOString(),
            endAt: item.endAt.toISOString(),
            notes: item.notes ?? null,
          }))}
        />
      </RoleShell>
    </main>
  );
}
