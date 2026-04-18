import { AdminShell } from '@/components/admin-shell';
import { SponsorManager } from '@/components/forms/sponsor-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminSponsorsPage() {
  const sponsors = await prisma.sponsor.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });

  return (
    <main>
      <AdminShell title="Sponsors" description="Create, edit, publish, and organize sponsor packages for the public website." currentPath="/admin/sponsors">
        <SponsorManager initialSponsors={sponsors.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          tier: item.tier,
          logoUrl: item.logoUrl,
          websiteUrl: item.websiteUrl,
          shortDescription: item.shortDescription,
          packageValue: item.packageValue,
          benefits: item.benefits,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        }))} />
      </AdminShell>
    </main>
  );
}
