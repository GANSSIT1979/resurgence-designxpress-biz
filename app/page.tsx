import Link from "next/link";
import { db } from "@/lib/db";
import { KPIGrid } from "@/components/kpi-grid";
import { SectionTitle } from "@/components/section-title";
import { currencyPHP, parseJsonSafely } from "@/lib/format";

export default async function HomePage() {
  const [packages, creators, sponsors, inventory, gallery] = await Promise.all([
    db.sponsorPackage.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 4
    }),
    db.creatorProfile.findMany({ where: { featured: true }, take: 3, orderBy: { fullName: "asc" } }),
    db.sponsor.findMany({ where: { status: "ACTIVE" }, take: 4, orderBy: { createdAt: "desc" } }),
    db.sponsorInventoryItem.findMany({ where: { active: true }, take: 4, orderBy: { createdAt: "desc" } }),
    db.galleryMedia.findMany({ where: { featured: true }, take: 4, orderBy: { createdAt: "desc" }, include: { event: true } })
  ]);

  return (
    <div className="page-shell">
      <div className="container">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">Sports Business Platform</div>
            <h1>RESURGENCE Powered by DesignXpress</h1>
            <p>
              A premium sports-business platform built for sponsorship partnerships, creator activations,
              gallery storytelling, inventory visibility, and operational reporting.
            </p>

            <KPIGrid
              items={[
                { label: "Combined Followers", value: "2.15M+" },
                { label: "Active Platforms", value: "2" },
                { label: "Creators", value: "6" },
                { label: "Sponsor Packages", value: "4" }
              ]}
            />

            <div className="hero-actions">
              <Link className="button" href="/sponsor/apply">
                Apply as Sponsor
              </Link>
              <Link className="button button-secondary" href="/contact">
                Contact Jake
              </Link>
            </div>
          </div>

          <div className="hero-media">
            <img src="/uploads/jake-image1.jpg" alt="Coach Jake / Resurgence" />
          </div>
        </section>

        <section className="section">
          <SectionTitle
            eyebrow="Sponsor Packages"
            title="Strategic partnership tiers"
            subtitle="Each package is structured for visibility, commercial alignment, and creator-led amplification."
          />
          <div className="grid-4">
            {packages.map((pkg) => (
              <div className="card" key={pkg.id}>
                <div className="card-title">{pkg.title}</div>
                <div className="kpi-value">{pkg.priceRange}</div>
                <p className="muted">{pkg.description}</p>
                <ul className="feature-list">
                  {parseJsonSafely<string[]>(pkg.benefits, []).slice(0, 3).map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="grid-2">
            <div className="card">
              <SectionTitle
                eyebrow="Contact Jake"
                title="Build your sponsorship with direct coordination"
                subtitle="Coordinate package selection, inventory inclusion, creator activations, and campaign timelines."
              />
              <p className="muted">
                Fast business consultation, sponsor package alignment, and event partnership planning for RESURGENCE.
              </p>
              <div className="hero-actions">
                <Link href="/contact" className="button">
                  Start a conversation
                </Link>
                <Link href="/support" className="button button-secondary">
                  Support desk
                </Link>
              </div>
            </div>

            <div className="card">
              <SectionTitle
                eyebrow="Media"
                title="Logo and poster / media section"
                subtitle="Use gallery-backed assets for campaigns, promotions, and partner presentations."
              />
              <div className="grid-2">
                <img src="/uploads/resurgence-logo.jpg" alt="Logo" style={{ borderRadius: 16, background: "white", padding: 16 }} />
                <img src="/uploads/jake-image2.jpg" alt="Poster" style={{ borderRadius: 16, height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <SectionTitle
            eyebrow="Gallery Preview"
            title="Recent featured media"
            subtitle="Event-based media blocks for homepage promotion and sponsor storytelling."
          />
          <div className="grid-4">
            {gallery.map((item) => (
              <div className="card gallery-card" key={item.id}>
                <img src={item.image} alt={item.title} />
                <div className="card-title">{item.title}</div>
                <div className="muted">{item.event?.title || "General Media"}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <SectionTitle
            eyebrow="Creator Network"
            title="High-engagement creator roster"
            subtitle="Each creator profile supports story, performance metrics, media image, and social channels."
          />
          <div className="grid-3">
            {creators.map((creator) => (
              <div className="card creator-card" key={creator.id}>
                <img src={creator.image || "/uploads/jake-image3.jpg"} alt={creator.fullName} />
                <div className="card-title">{creator.fullName}</div>
                <p className="muted">{creator.biography}</p>
                <div className="inline-actions">
                  <Link href={`/creator/${creator.slug}`} className="button button-small">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <SectionTitle
            eyebrow="Sponsor Inventory"
            title="Inventory highlights for commercial value"
            subtitle="Assets are organized for branding, digital integration, on-ground activation, and commercial support."
          />
          <div className="grid-4">
            {inventory.map((item) => (
              <div className="card" key={item.id}>
                <div className="card-title">{item.title}</div>
                <div className="muted">{item.category}</div>
                <p>{item.description}</p>
                <strong>{currencyPHP(String(item.value))}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <SectionTitle
            eyebrow="Sponsor Network"
            title="Active sponsor and partner visibility"
            subtitle="Structured for trust, proof, and premium business positioning."
          />
          <div className="logo-strip">
            {sponsors.map((sponsor) => (
              <div className="card sponsor-logo-card" key={sponsor.id}>
                <img src={sponsor.logo || "/uploads/resurgence-logo.jpg"} alt={sponsor.name} />
                <strong>{sponsor.name}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="card banner-card">
            <div>
              <div className="eyebrow">Strong CTA</div>
              <h2>Ready to partner with RESURGENCE?</h2>
              <p className="muted">Launch sponsor placements, creator campaigns, and commercial support packages from one operational platform.</p>
            </div>
            <div className="inline-actions">
              <Link className="button" href="/sponsor/apply">
                Become a Sponsor
              </Link>
              <Link className="button button-secondary" href="/sponsors">
                View Sponsors
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
