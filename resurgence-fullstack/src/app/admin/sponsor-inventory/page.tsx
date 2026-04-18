import { AdminShell } from '@/components/admin-shell';
import { SponsorInventoryManager } from '@/components/forms/sponsor-inventory-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SponsorInventoryPage() {
  const initialItems = await prisma.sponsorInventoryCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <main>
      <AdminShell
        title="Sponsor Inventory CMS"
        description="Manage Branding Assets, Digital Integration, On-Ground Activation, and Commercial Support sections used across the sponsorship deck and public site."
        currentPath="/admin/sponsor-inventory"
      >
        <SponsorInventoryManager initialItems={initialItems} />
      </AdminShell>
    </main>
  );
}
