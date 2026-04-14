import Link from "next/link";
import { db } from "@/lib/db";
import { KPIGrid } from "@/components/kpi-grid";
import { SectionTitle } from "@/components/section-title";
import { currencyPHP, parseJsonSafely } from "@/lib/format";

export const dynamic = "force-dynamic";

type HomePackage = {
  id: string;
  title: string;
  priceRange: string;
  description: string | null;
  benefits: string | null;
};

type HomeCreator = {
  id: string;
  fullName: string;
  biography: string | null;
  image: string | null;
  slug: string;
};

type HomeSponsor = {
  id: string;
  name: string;
  logo: string | null;
};

type HomeInventory = {
  id: string;
  title: string;
  category: string;
  description: string;
  value: number | string;
};

type HomeGallery = {
  id: string;
  title: string;
  image: string;
  event: { title: string } | null;
};

const fallbackPackages: HomePackage[] = [
  {
    id: "pkg-supporting",
    title: "Supporting Sponsor",
    priceRange: "PHP 15,000–50,000",
    description: "Entry partnership tier for brand presence, campaign visibility, and event support.",
    benefits: JSON.stringify([
      "Brand logo placement",
      "Social campaign inclusion",
      "Community basketball exposure",
    ]),
  },
  {
    id: "pkg-official",
    title: "Official Brand Partner",
    priceRange: "PHP 75,000–95,000",
    description: "Expanded visibility with stronger brand integration across creator-led content and promotional assets.",
    benefits: JSON.stringify([
      "Featured sponsor positioning",
      "Creator integration opportunities",
      "Website and event visibility",
    ]),
  },
  {
    id: "pkg-major",
    title: "Major Partner",
    priceRange: "PHP 120,000–150,000",
    description: "Premium partnership track for strategic campaigns, deeper activation, and executive brand visibility.",
    benefits: JSON.stringify([
      "Priority campaign integration",
      "Event and digital support assets",
      "Premium partner recognition",
    ]),
  },
  {
    id: "pkg-event",
    title: "Event Presenting",
    priceRange: "Custom Proposal",
    description: "Top-tier presenting package tailored to event scope, media requirements, and commercial goals.",
    benefits: JSON.stringify([
      "Naming-rights style visibility",
      "Custom proposal planning",
      "High-impact event exposure",
    ]),
  },
];

const fallbackCreators: HomeCreator[] = [
  {
    id: "creator-jake",
    fullName: "Jake Anilao",
    biography: "Leadership-driven sports creator and team-facing business coordinator.",
    image: "/uploads/jake-image1.jpg",
    slug: "jake-anilao",
  },
  {
    id: "creator-gab",
    fullName: "Gab Dimalanta",
    biography: "Basketball-focused creator profile designed for brand and audience engagement.",
    image: "/uploads/gab-image.jpg",
    slug: "gab-dimalanta",
  },
  {
    id: "creator-klint",
    fullName: "Klint Almine",
    biography: "Creator roster member for sports content, collaborations, and community campaigns.",
    image: "/uploads/klint-image1.jpg",
    slug: "klint-almine",
  },
];

const fallbackSponsors: HomeSponsor[] = [
  { id: "sponsor-1", name: "Northline Nutrition", logo: "/uploads/resurgence-logo.jpg" },
  { id: "sponsor-2", name: "RESURGENCE Partner", logo: "/uploads/resurgence-logo.jpg" },
];

const fallbackInventory: HomeInventory[] = [
  {
    id: "inventory-1",
    title: "Courtside Branding Assets",
    category: "Branding Assets",
    description: "High-visibility event-facing branding placements for premium exposure.",
    value: 25000,
  },
  {
    id: "inventory-2",
    title: "Creator-led Digital Features",
    category: "Digital Integration",
    description: "Content integration opportunities across featured creators and platform channels.",
    value: 40000,
  },
  {
    id: "inventory-3",
    title: "On-Ground Activation Slot",
    category: "On-Ground Activation",
    description: "Physical event activation support for engagement, sampling, or promotional presence.",
    value: 55000,
  },
  {
    id: "inventory-4",
    title: "Commercial Support Bundle",
    category: "Commercial Support",
    description: "Integrated campaign support package for partner growth and visibility.",
    value: 65000,
  },
];

const fallbackGallery: HomeGallery[] = [
  { id: "gallery-1", title: "RESURGENCE Feature Visual", image: "/uploads/jake-image2.jpg", event: { title: "Featured Campaign" } },
  { id: "gallery-2", title: "Creator Poster Asset", image: "/uploads/jake-image3.jpg", event: { title: "Promo Media" } },
  { id: "gallery-3", title: "Team Storytelling Visual", image: "/uploads/angelo-image1.jpg", event: { title: "Community Event" } },
  { id: "gallery-4", title: "Brand Presentation Asset", image: "/uploads/resurgence-logo.jpg", event: { title: "Brand Media" } },
];

function firstItems<T>(items: T[] | null | undefined, fallback: T[], take: number): T[] {
  if (items && items.length > 0) {
    return items.slice(0, take);
  }
  return fallback.slice(0, take);
}

export default async function HomePage() {
  let packages: HomePackage[] = [];
  let creators: HomeCreator[] = [];
  let sponsors: HomeSponsor[] = [];
  let inventory: HomeInventory[] = [];
  let gallery: HomeGallery[] = [];

  try {
    const [packagesResult, creatorsResult, sponsorsResult, inventoryResult, galleryResult] = await Promise.all([
      db.sponsorPackage.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 4,
      }),
      db.creatorProfile.findMany({
        where: { featured: true },
        take: 3,
        orderBy: { fullName: "asc" },
      }),
      db.sponsor.findMany({
        where: { status: "ACTIVE" },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      db.sponsorInventoryItem.findMany({
        where: { active: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      db.galleryMedia.findMany({
        where: { featured: true },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { event: true },
      }),
    ]);

    packages = packagesResult;
    creators = creatorsResult;
    sponsors = sponsorsResult;
    inventory = inventoryResult;
    gallery = galleryResult.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      event: item.event ? { title: item.event.title } : null,
    }));
  } catch (error) {
    console.error("Home page fallback mode enabled:", error);
  }

  const homePackages = firstItems(packages, fallbackPackages, 4);
  const homeCreators = firstItems(creators, fallbackCreators, 3);
  const homeSponsors = firstItems(sponsors, fallbackSponsors, 4);
  const homeInventory = firstItems(inventory, fallbackInventory, 4);
  const homeGallery = firstItems(gallery, fallbackGallery, 4);

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
                { label: "Sponsor Packages", value: "4" },
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
            {homePackages.map((pkg) => (
              <div className="card" key={pkg.id}>
                <div className="card-title">{pkg.title}</div>
                <div className="kpi-value">{pkg.priceRange}</div>
                <p className="muted">{pkg.description || "Package details are available through the RESURGENCE team."}</p>
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
              <div className="media-pair">
                <img src="/uploads/resurgence-logo.jpg" alt="RESURGENCE logo" />
                <img src="/uploads/jake-image2.jpg" alt="RESURGENCE poster" />
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
            {homeGallery.map((item) => (
              <div className="card gallery-card" key={item.id}>
                <img src={item.image || "/uploads/resurgence-logo.jpg"} alt={item.title} loading="lazy" />
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
            {homeCreators.map((creator) => (
              <div className="card creator-card" key={creator.id}>
                <img src={creator.image || "/uploads/jake-image3.jpg"} alt={creator.fullName} loading="lazy" />
                <div className="card-title">{creator.fullName}</div>
                <p className="muted">{creator.biography || "Featured creator profile available for sponsorship-aligned campaigns."}</p>
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
            {homeInventory.map((item) => (
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
            {homeSponsors.map((sponsor) => (
              <div className="card sponsor-logo-card" key={sponsor.id}>
                <img src={sponsor.logo || "/uploads/resurgence-logo.jpg"} alt={sponsor.name} loading="lazy" />
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
              <p className="muted">
                Launch sponsor placements, creator campaigns, and commercial support packages from one operational platform.
              </p>
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
