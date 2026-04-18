import { PartnerCampaignManager } from '@/components/forms/partner-campaign-manager';
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
        <RoleShell roleLabel="Partner" title="Campaigns" description="Review shared campaigns and collaboration status." navItems={[...partnerNavItems]} currentPath="/partner/campaigns">
          <section className="card"><p className="section-copy">Unable to load partner session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const campaigns = await prisma.partnerCampaign.findMany({
    where: { partnerProfileId: context.partnerProfile.id },
    orderBy: [{ status: 'asc' }, { startDate: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <main>
      <RoleShell roleLabel="Partner" title="Campaigns" description="Create, update, and monitor partner campaigns, timelines, values, and asset links." navItems={[...partnerNavItems]} currentPath="/partner/campaigns">
        <PartnerCampaignManager
          initialItems={campaigns.map((item) => ({
            ...item,
            description: item.description ?? null,
            startDate: item.startDate ? item.startDate.toISOString() : null,
            endDate: item.endDate ? item.endDate.toISOString() : null,
            contributionValue: item.contributionValue ?? null,
            assetLink: item.assetLink ?? null,
          }))}
        />
      </RoleShell>
    </main>
  );
}
