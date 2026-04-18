import { RoleShell } from '@/components/role-shell';
import { prisma } from '@/lib/prisma';
import { sponsorNavItems } from '@/lib/sponsor';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';

export const dynamic = 'force-dynamic';

export default async function SponsorPackagesPage() {
  const context = await getCurrentSponsorContext();
  const [packages, inventory] = await Promise.all([
    prisma.sponsorPackageTemplate.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }] }),
    prisma.sponsorInventoryCategory.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }] }),
  ]);

  return (
    <main>
      <RoleShell
        roleLabel="Sponsor"
        title="Sponsorship Packages"
        description="Review live package templates, benefits, and sponsor inventory categories available through the RESURGENCE sponsorship proposal."
        navItems={sponsorNavItems as any}
        currentPath="/sponsor/packages"
      >
        <div className="card-grid grid-4">
          {packages.map((item) => (
            <div className="card" key={item.id}>
              <div className="section-kicker">{item.tier}</div>
              <h2 style={{ marginTop: 0 }}>{item.name}</h2>
              <p className="helper">{item.rangeLabel}</p>
              <p className="section-copy">{item.summary}</p>
              <div className="helper">
                {context?.sponsorProfile.preferredPackageId === item.id ? 'Current preferred package' : 'Available package template'}
              </div>
              <ul>
                {item.benefits.split('\n').map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="card" style={{ marginTop: 20 }}>
          <div className="section-kicker">Inventory Categories</div>
          <div className="card-grid grid-2" style={{ marginTop: 16 }}>
            {inventory.map((item) => (
              <div className="panel" key={item.id}>
                <strong>{item.name}</strong>
                <p className="section-copy">{item.description}</p>
                <div className="helper">{item.examples}</div>
              </div>
            ))}
          </div>
        </section>
      </RoleShell>
    </main>
  );
}
