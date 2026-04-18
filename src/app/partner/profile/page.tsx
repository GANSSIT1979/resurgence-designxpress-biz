import { PartnerProfileForm } from '@/components/forms/partner-profile-form';
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
        <RoleShell roleLabel="Partner" title="Partner Profile" description="Manage partner account profile and collaboration details." navItems={[...partnerNavItems]} currentPath="/partner/profile">
          <section className="card"><p className="section-copy">Unable to load partner session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <main>
      <RoleShell roleLabel="Partner" title="Partner Profile" description="Update linked partner identity, company details, preferred services, and collaboration assets." navItems={[...partnerNavItems]} currentPath="/partner/profile">
        <PartnerProfileForm
          initialItem={{
            id: context.partnerProfile.id,
            partnerId: context.partnerProfile.partnerId,
            companyName: context.partnerProfile.companyName,
            contactName: context.partnerProfile.contactName,
            contactEmail: context.partnerProfile.contactEmail,
            phone: context.partnerProfile.phone,
            websiteUrl: context.partnerProfile.websiteUrl,
            address: context.partnerProfile.address,
            companySummary: context.partnerProfile.companySummary,
            assetLink: context.partnerProfile.assetLink,
            preferredServices: context.partnerProfile.preferredServices,
          }}
          partners={partners.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
          }))}
        />
      </RoleShell>
    </main>
  );
}
