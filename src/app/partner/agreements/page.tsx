import { PartnerAgreementManager } from '@/components/forms/partner-agreement-manager';
import { RoleShell } from '@/components/role-shell';
import { partnerNavItems } from '@/lib/partner';
import { getCurrentPartnerContext } from '@/lib/partner-server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const context = await getCurrentPartnerContext();

  if (!context) {
    return (
      <main>
        <RoleShell roleLabel="Partner" title="Agreements" description="Review commercial agreements and partner documentation." navItems={[...partnerNavItems]} currentPath="/partner/agreements">
          <section className="card"><p className="section-copy">Unable to load partner session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const agreements = await prisma.partnerAgreement.findMany({
    where: { partnerProfileId: context.partnerProfile.id },
    orderBy: [{ status: 'asc' }, { startDate: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <main>
      <RoleShell roleLabel="Partner" title="Agreements" description="Maintain partner agreement records, commercial status, and renewal windows." navItems={[...partnerNavItems]} currentPath="/partner/agreements">
        <PartnerAgreementManager
          initialItems={agreements.map((item) => ({
            ...item,
            startDate: item.startDate ? item.startDate.toISOString() : null,
            endDate: item.endDate ? item.endDate.toISOString() : null,
            documentUrl: item.documentUrl ?? null,
            notes: item.notes ?? null,
          }))}
        />
      </RoleShell>
    </main>
  );
}
