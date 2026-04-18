import { SponsorDeliverableManager } from '@/components/forms/sponsor-deliverable-manager';
import { RoleShell } from '@/components/role-shell';
import { prisma } from '@/lib/prisma';
import { sponsorNavItems } from '@/lib/sponsor';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';

export const dynamic = 'force-dynamic';

export default async function SponsorDeliverablesPage() {
  const context = await getCurrentSponsorContext();

  if (!context) {
    return (
      <main>
        <RoleShell roleLabel="Sponsor" title="Deliverables" description="Track sponsor deliverables." navItems={sponsorNavItems as any} currentPath="/sponsor/deliverables">
          <section className="card"><p className="section-copy">Unable to load sponsor session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const [deliverables, categories] = await Promise.all([
    prisma.sponsorDeliverable.findMany({ where: { sponsorProfileId: context.sponsorProfile.id }, orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }] }),
    prisma.sponsorInventoryCategory.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }] }),
  ]);

  return (
    <main>
      <RoleShell roleLabel="Sponsor" title="Deliverables" description="Track branding assets, digital integration, on-ground activation, and commercial support deliverables assigned to your sponsor account." navItems={sponsorNavItems as any} currentPath="/sponsor/deliverables">
        <SponsorDeliverableManager
          initialItems={deliverables.map((item) => ({
            ...item,
            dueDate: item.dueDate ? item.dueDate.toISOString() : null,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            assetLink: item.assetLink ?? null,
            sponsorNotes: item.sponsorNotes ?? null,
            adminNotes: item.adminNotes ?? null,
          }))}
          categories={categories.map((item) => ({ id: item.id, name: item.name }))}
        />
      </RoleShell>
    </main>
  );
}
