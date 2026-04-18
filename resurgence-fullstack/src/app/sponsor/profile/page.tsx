import { SponsorProfileForm } from '@/components/forms/sponsor-profile-form';
import { RoleShell } from '@/components/role-shell';
import { prisma } from '@/lib/prisma';
import { sponsorNavItems } from '@/lib/sponsor';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';

export const dynamic = 'force-dynamic';

export default async function SponsorProfilePage() {
  const context = await getCurrentSponsorContext();

  if (!context) {
    return (
      <main>
        <RoleShell roleLabel="Sponsor" title="Sponsor Profile" description="Manage sponsor account details." navItems={sponsorNavItems as any} currentPath="/sponsor/profile">
          <section className="card"><p className="section-copy">Unable to load sponsor session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const [sponsors, packages] = await Promise.all([
    prisma.sponsor.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
    prisma.sponsorPackageTemplate.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
  ]);

  return (
    <main>
      <RoleShell roleLabel="Sponsor" title="Sponsor Profile" description="Manage sponsor account details, linked sponsor record, and preferred package visibility for the portal." navItems={sponsorNavItems as any} currentPath="/sponsor/profile">
        <SponsorProfileForm
          initialItem={{
            id: context.sponsorProfile.id,
            sponsorId: context.sponsorProfile.sponsorId,
            preferredPackageId: context.sponsorProfile.preferredPackageId,
            companyName: context.sponsorProfile.companyName,
            contactName: context.sponsorProfile.contactName,
            contactEmail: context.sponsorProfile.contactEmail,
            phone: context.sponsorProfile.phone,
            websiteUrl: context.sponsorProfile.websiteUrl,
            address: context.sponsorProfile.address,
            brandSummary: context.sponsorProfile.brandSummary,
            assetLink: context.sponsorProfile.assetLink,
          }}
          sponsors={sponsors.map((item) => ({ id: item.id, name: item.name, tier: item.tier }))}
          packages={packages.map((item) => ({ id: item.id, name: item.name, rangeLabel: item.rangeLabel }))}
        />
      </RoleShell>
    </main>
  );
}
