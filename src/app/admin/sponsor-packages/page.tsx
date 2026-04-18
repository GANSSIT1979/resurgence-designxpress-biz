import { AdminShell } from '@/components/admin-shell';
import { SponsorPackageManager } from '@/components/forms/sponsor-package-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SponsorPackagesPage() {
  const initialItems = await prisma.sponsorPackageTemplate.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <main>
      <AdminShell
        title="Sponsor Package Templates"
        description="Keep the sponsor application form, public deck messaging, and admin CMS package tiers aligned with the 2026 sponsorship proposal."
        currentPath="/admin/sponsor-packages"
      >
        <SponsorPackageManager initialItems={initialItems} />
      </AdminShell>
    </main>
  );
}
