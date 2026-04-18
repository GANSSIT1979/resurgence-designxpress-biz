import { SponsorPortalApplicationManager } from '@/components/forms/sponsor-portal-application-manager';
import { RoleShell } from '@/components/role-shell';
import { prisma } from '@/lib/prisma';
import { sponsorNavItems } from '@/lib/sponsor';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';

export const dynamic = 'force-dynamic';

export default async function SponsorApplicationsPage() {
  const context = await getCurrentSponsorContext();

  if (!context) {
    return (
      <main>
        <RoleShell roleLabel="Sponsor" title="My Applications" description="Create and manage sponsor-side applications." navItems={sponsorNavItems as any} currentPath="/sponsor/applications">
          <section className="card"><p className="section-copy">Unable to load sponsor session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const [applications, packages] = await Promise.all([
    prisma.sponsorSubmission.findMany({ where: { sponsorProfileId: context.sponsorProfile.id }, orderBy: [{ createdAt: 'desc' }] }),
    prisma.sponsorPackageTemplate.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
  ]);

  return (
    <main>
      <RoleShell roleLabel="Sponsor" title="My Applications" description="Create and manage sponsor-side applications using the same package names and ranges as the 2026 sponsorship deck." navItems={sponsorNavItems as any} currentPath="/sponsor/applications">
        <SponsorPortalApplicationManager
          initialItems={applications.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            phone: item.phone ?? null,
            websiteUrl: item.websiteUrl ?? null,
            timeline: item.timeline ?? null,
            internalNotes: item.internalNotes ?? null,
          }))}
          packages={packages.map((item) => ({ id: item.id, name: item.name, rangeLabel: item.rangeLabel }))}
          profile={{
            companyName: context.sponsorProfile.companyName,
            contactName: context.sponsorProfile.contactName,
            contactEmail: context.sponsorProfile.contactEmail,
            phone: context.sponsorProfile.phone,
            websiteUrl: context.sponsorProfile.websiteUrl,
            preferredPackageName: context.sponsorProfile.preferredPackage?.name,
          }}
        />
      </RoleShell>
    </main>
  );
}
