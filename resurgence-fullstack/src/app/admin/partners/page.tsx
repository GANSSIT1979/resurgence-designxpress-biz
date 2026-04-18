import { AdminShell } from '@/components/admin-shell';
import { PartnerManager } from '@/components/forms/partner-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });

  return (
    <main>
      <AdminShell title="Partners" description="Manage organizations, media allies, operations collaborators, and other partner entries." currentPath="/admin/partners">
        <PartnerManager initialPartners={partners.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          category: item.category,
          logoUrl: item.logoUrl,
          websiteUrl: item.websiteUrl,
          shortDescription: item.shortDescription,
          services: item.services,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        }))} />
      </AdminShell>
    </main>
  );
}
