import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SponsorsPage() {
  const [packages, creators, inventory] = await Promise.all([
    prisma.sponsorPackageTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.creatorProfile.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.sponsorInventoryCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
  ]);

  return (
    <main className="section">
      <div className="container">
        <div className="section-kicker">Sponsor Packages</div>
        <h1 className="section-title">Deck-aligned sponsorship tiers for brands that want basketball visibility and creator-powered reach.</h1>
        <p className="section-copy" style={{ maxWidth: 860 }}>
          Each package is structured around branding assets, digital integration, on-ground activation, and commercial support with consistent naming across the proposal deck, application form, and admin CMS.
        </p>

        <div className="btn-row" style={{ marginTop: 18 }}>
          <a className="button-link" href="/sponsor/apply">Apply as Sponsor</a>
          <a className="button-link btn-secondary" href="/contact">Request a proposal</a>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 26 }}>
          {packages.map((item) => (
            <article className="card" key={item.id}>
              <div className="badge">{item.tier}</div>
              <h2 style={{ marginBottom: 4 }}>{item.name}</h2>
              <div className="helper">Indicative package value</div>
              <strong style={{ display: 'block', fontSize: '2rem', marginTop: 10 }}>{item.rangeLabel}</strong>
              <p className="section-copy" style={{ fontSize: '1rem' }}>{item.summary}</p>
              <ul className="list-clean">
                {item.benefits.split('\n').map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 28 }}>
          <section className="card">
            <div className="section-kicker">Creator Network</div>
            <h2 style={{ marginTop: 0 }}>Current roster</h2>
            <ul className="list-clean">
              {creators.map((creator) => (
                <li key={creator.id}>{creator.name} — {creator.roleLabel}</li>
              ))}
            </ul>
          </section>
          <section className="card">
            <div className="section-kicker">Inventory Categories</div>
            <h2 style={{ marginTop: 0 }}>Activation structure</h2>
            <ul className="list-clean">
              {inventory.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
