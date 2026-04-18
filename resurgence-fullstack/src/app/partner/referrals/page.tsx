import { PartnerReferralManager } from '@/components/forms/partner-referral-manager';
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
        <RoleShell roleLabel="Partner" title="Referrals" description="Track referrals, contribution opportunities, and pipeline activity." navItems={[...partnerNavItems]} currentPath="/partner/referrals">
          <section className="card"><p className="section-copy">Unable to load partner session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const referrals = await prisma.partnerReferral.findMany({
    where: { partnerProfileId: context.partnerProfile.id },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <main>
      <RoleShell roleLabel="Partner" title="Referrals" description="Track inbound leads, update referral pipeline status, and estimate contribution value." navItems={[...partnerNavItems]} currentPath="/partner/referrals">
        <PartnerReferralManager
          initialItems={referrals.map((item) => ({
            ...item,
            phone: item.phone ?? null,
            notes: item.notes ?? null,
            estimatedValue: item.estimatedValue ?? null,
          }))}
        />
      </RoleShell>
    </main>
  );
}
