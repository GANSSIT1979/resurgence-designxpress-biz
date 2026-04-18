import { NotificationCenter } from '@/components/notification-center';
import { getAutomationInbox } from '@/lib/notifications';
import { RoleShell } from '@/components/role-shell';
import { partnerNavItems } from '@/lib/partner';
import { getCurrentPartnerContext } from '@/lib/partner-server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PartnerDashboardPage() {
  const context = await getCurrentPartnerContext();

  if (!context) {
    return (
      <main>
        <RoleShell
          roleLabel="Partner"
          title="Partner Collaboration Overview"
          description="Monitor active partnership visibility, campaigns, referral readiness, shared materials, and agreement support."
          navItems={[...partnerNavItems]}
          currentPath="/partner"
        >
          <section className="card">
            <p className="section-copy">Unable to load partner session.</p>
          </section>
        </RoleShell>
      </main>
    );
  }

  const [
    creatorCount,
    campaignCount,
    activeCampaigns,
    referralCount,
    qualifiedReferrals,
    agreementCount,
    activeAgreements,
  ] = await Promise.all([
    prisma.creatorProfile.count({ where: { isActive: true } }),
    prisma.partnerCampaign.count({ where: { partnerProfileId: context.partnerProfile.id } }),
    prisma.partnerCampaign.count({ where: { partnerProfileId: context.partnerProfile.id, status: 'ACTIVE' } }),
    prisma.partnerReferral.count({ where: { partnerProfileId: context.partnerProfile.id } }),
    prisma.partnerReferral.count({ where: { partnerProfileId: context.partnerProfile.id, status: { in: ['QUALIFIED', 'WON'] } } }),
    prisma.partnerAgreement.count({ where: { partnerProfileId: context.partnerProfile.id } }),
    prisma.partnerAgreement.count({ where: { partnerProfileId: context.partnerProfile.id, status: 'ACTIVE' } }),
  ]);
  const inbox = await getAutomationInbox(context.user.role, context.user.id, 6);

  return (
    <main>
      <RoleShell
        roleLabel="Partner"
        title="Partner Collaboration Overview"
        description={`Track campaigns, referrals, agreements, and partner identity for ${context.partnerProfile.companyName}.`}
        navItems={[...partnerNavItems]}
        currentPath="/partner"
      >
        <div className="card-grid grid-4">
          <div className="panel"><strong>{campaignCount}</strong><div className="helper">Campaigns tracked</div></div>
          <div className="panel"><strong>{activeCampaigns}</strong><div className="helper">Active campaigns</div></div>
          <div className="panel"><strong>{referralCount}</strong><div className="helper">Referrals logged</div></div>
          <div className="panel"><strong>{qualifiedReferrals}</strong><div className="helper">Qualified or won</div></div>
          <div className="panel"><strong>{agreementCount}</strong><div className="helper">Agreements on file</div></div>
          <div className="panel"><strong>{activeAgreements}</strong><div className="helper">Active agreements</div></div>
          <div className="panel"><strong>{creatorCount}</strong><div className="helper">Creators in network</div></div>
          <div className="panel"><strong>{context.partnerProfile.partner ? 1 : 0}</strong><div className="helper">Linked partner record</div></div>
        </div>

        <div style={{ marginTop: 20 }}>
          <NotificationCenter
            title="Partner alerts and automation"
            notifications={inbox.notifications}
            emails={inbox.emails}
          />
        </div>
      </RoleShell>
    </main>
  );
}
