import Link from 'next/link';
import type { Metadata } from 'next';
import type { FeedResponse } from '@/lib/feed/types';
import { getFeaturedShopProducts, getHomeData, getProductServices } from '@/lib/site';
import { buildHomeMetadata } from '@/lib/metadata';
import { getPublicSettings } from '@/lib/settings';
import { formatPeso } from '@/lib/shop';
import { VerticalMediaFeed } from '@/components/vertical-media-feed';
import { CreatorCommerceFeed } from '@/components/feed/creator-commerce-feed';
import { getPublicFeed } from '@/lib/feed/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return buildHomeMetadata(settings);
}

const fallbackHomeData = {
  contentMap: {
    'home.hero': {
      key: 'home.hero',
      subtitle: 'Welcome',
      title: 'RESURGENCE',
      body: 'Sponsor, creator, merch, and event platform.',
      ctaHref: '/sponsor/apply',
      ctaLabel: 'Apply as Sponsor',
    },
    'home.about': {
      key: 'home.about',
      subtitle: 'About',
      title: 'About RESURGENCE',
      body: 'Built for sponsor visibility, engagement, and activation.',
      ctaHref: '/sponsors',
      ctaLabel: 'View Sponsor Packages',
    },
  },
  sponsors: [],
  partners: [],
  packageTemplates: [],
  stats: [],
  creators: [],
  inventoryCategories: [],
  galleryEvents: [],
};

const fallbackSettings = {
  brandName: 'RESURGENCE',
  siteUrl: 'https://www.resurgence-dx.biz',
  contactName: 'RESURGENCE Team',
  contactRole: 'Support',
  contactEmail: 'support@resurgence-dx.biz',
  contactPhone: '',
  supportEmail: 'support@resurgence-dx.biz',
  supportPhone: '',
  businessHours: 'Business hours unavailable',
  contactAddress: 'Coverage unavailable',
};

const fallbackFeed = {
  items: [],
  nextCursor: null,
  source: 'gallery-fallback',
} satisfies FeedResponse;

function getValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback;
}

function safeLines(value?: string | null) {
  return (value ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function HomePage() {
  const results = await Promise.allSettled([
    getHomeData(),
    getProductServices(),
    getPublicSettings(),
    getFeaturedShopProducts(4),
    getPublicFeed({ limit: 8 }),
  ]);

  const homeData = getValue(results[0], fallbackHomeData);
  const services = getValue(results[1], []);
  const settings = getValue(results[2], fallbackSettings);
  const shopProducts = getValue(results[3], []);
  const feed = getValue(results[4], fallbackFeed);

  const {
    contentMap = {},
    sponsors = [],
    partners = [],
    stats = [],
    creators = [],
    inventoryCategories = [],
    galleryEvents = [],
  } = homeData;

  const hero = contentMap['home.hero'] ?? fallbackHomeData.contentMap['home.hero'];
  const about = contentMap['home.about'] ?? fallbackHomeData.contentMap['home.about'];

  const brandName = settings.brandName ?? fallbackSettings.brandName;
  const siteUrl = settings.siteUrl ?? fallbackSettings.siteUrl;
  const contactName = settings.contactName ?? fallbackSettings.contactName;
  const contactRole = settings.contactRole ?? fallbackSettings.contactRole;
  const contactEmail = settings.contactEmail ?? fallbackSettings.contactEmail;
  const contactPhone = settings.contactPhone ?? fallbackSettings.contactPhone;
  const supportEmail = settings.supportEmail ?? fallbackSettings.supportEmail;
  const supportPhone = settings.supportPhone ?? fallbackSettings.supportPhone;
  const businessHours = settings.businessHours ?? fallbackSettings.businessHours;
  const contactAddress = settings.contactAddress ?? fallbackSettings.contactAddress;
  const creatorLaneCount = new Set((feed.items || []).map((item) => item.creator?.id).filter(Boolean)).size;
  const shoppableFeedCount = (feed.items || []).filter((item) => item.productTags.length).length;
  const sponsorMomentCount = (feed.items || []).filter((item) => item.sponsorPlacements.length).length;
  const trendingHashtags = Array.from(
    new Map(
      (feed.items || [])
        .flatMap((item) => item.hashtags)
        .map((tag) => [tag.normalizedName, tag.label.startsWith('#') ? tag.label : `#${tag.label}`] as const),
    ).values(),
  ).slice(0, 4);

  return (
    <main>
      <CreatorCommerceFeed
        initialItems={feed.items ?? []}
        initialCursor={feed.nextCursor ?? null}
        source={feed.source}
        surface="home"
      />

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="badge">{hero.subtitle}</span>
            <h1 className="hero-title">{hero.title}</h1>
            <p className="hero-copy">
              {hero.body} The upgraded experience puts creator media, merch discovery, sponsor visibility, and community momentum into a single dark, mobile-first flow.
            </p>
            <div className="btn-row" style={{ marginTop: 22 }}>
              <Link href="/feed" className="button-link">Open For You Feed</Link>
              <Link href="/sponsors" className="button-link btn-secondary">
                View Sponsor Packages
              </Link>
              <Link href="/login" className="button-link btn-secondary">
                Join the Platform
              </Link>
            </div>
            <div className="stat-grid">
              {(stats ?? []).map((stat: any) => (
                <div className="stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <div className="helper">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-art">
            <img src="/assets/resurgence-poster.jpg" alt="RESURGENCE team poster" />
            <div className="hero-art-copy">
              <div className="badge">Opportunity Summary</div>
              <h3 style={{ fontSize: '1.7rem', marginBottom: 0 }}>
                A premium sports and creator platform built for sponsor visibility, engagement, and commercial activation.
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 36 }}>
        <div className="container">
          <div className="card-grid grid-4">
            <article className="card">
              <div className="section-kicker">Feed Ready</div>
              <strong style={{ fontSize: '2rem' }}>{feed.items.length}</strong>
              <div className="helper">Live posts and fallback stories currently loaded</div>
            </article>
            <article className="card">
              <div className="section-kicker">Creator Lanes</div>
              <strong style={{ fontSize: '2rem' }}>{creatorLaneCount}</strong>
              <div className="helper">Creators already represented in the public scroll</div>
            </article>
            <article className="card">
              <div className="section-kicker">Shop-linked</div>
              <strong style={{ fontSize: '2rem' }}>{shoppableFeedCount}</strong>
              <div className="helper">Feed moments already connected to merch</div>
            </article>
            <article className="card">
              <div className="section-kicker">Sponsor Pulse</div>
              <strong style={{ fontSize: '2rem' }}>{sponsorMomentCount}</strong>
              <div className="helper">Approved sponsor or promoted moments in current content</div>
            </article>
          </div>

          {trendingHashtags.length ? (
            <div className="btn-row" style={{ marginTop: 20 }}>
              {trendingHashtags.map((tag) => (
                <Link className="button-link btn-secondary" href="/feed" key={tag}>
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <div className="section-kicker">{about.subtitle}</div>
            <h2 className="section-title">{about.title}</h2>
            <p className="section-copy">{about.body}</p>
            <div className="btn-row" style={{ marginTop: 18 }}>
              <Link href={about.ctaHref || '/sponsors'} className="button-link">
                {about.ctaLabel || 'View Sponsor Packages'}
              </Link>
            </div>
          </div>
          <div className="panel">
            <div className="section-kicker">Core Objectives</div>
            <ul className="list-clean">
              <li>Deliver sponsor value through creator reach, digital integration, and event visibility.</li>
              <li>Standardize package presentation around the 2026 sponsorship proposal.</li>
              <li>Support commercial conversations with structured activation inventory.</li>
              <li>Turn community sports energy into measurable brand opportunity.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="section-kicker">Inventory</div>
          <h2 className="section-title">Four sponsor-ready activation layers.</h2>
          <p className="section-copy" style={{ maxWidth: 760 }}>
            The updated platform now presents sponsor opportunities through inventory sections that map directly to the 2026 proposal deck.
          </p>

          <div className="feature-row" style={{ marginTop: 24 }}>
            {(services ?? []).map((service: any) => (
              <article className="card" key={service.id || service.name}>
                <h3>{service.name}</h3>
                <p className="section-copy" style={{ fontSize: '1rem' }}>{service.description}</p>
              </article>
            ))}
          </div>

          <div className="card-grid grid-2" style={{ marginTop: 20 }}>
            {(inventoryCategories ?? []).map((item: any) => (
              <article className="card" key={item.id}>
                <div className="section-kicker">{item.name}</div>
                <p className="section-copy" style={{ fontSize: '1rem' }}>{item.description}</p>
                <ul className="list-clean">
                  {safeLines(item.examples).map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="section-kicker">Official Resurgence Merch</div>
          <h2 className="section-title">Court-ready merch now live inside Resurgence.</h2>
          <p className="section-copy" style={{ maxWidth: 760 }}>
            Launch jerseys, caps, shirts, hoodies, tumblers, and future drops from the same live platform that powers your sponsorship and creator workflows.
          </p>
          <div className="card-grid grid-4" style={{ marginTop: 24 }}>
            {(shopProducts ?? []).map((product: any) => (
              <article className="card" key={product.id}>
                <img
                  src={product.imageUrl || '/assets/resurgence-poster.jpg'}
                  alt={product.name}
                  style={{ width: '100%', borderRadius: 18, aspectRatio: '16 / 10', objectFit: 'cover', marginBottom: 16 }}
                />
                <div className="helper">{product.category?.name || 'Official Merch'}</div>
                <h3 style={{ marginBottom: 8 }}>{product.name}</h3>
                <p className="helper">{formatPeso(product.price)}</p>
                <div className="btn-row" style={{ marginTop: 16 }}>
                  <Link href={`/shop/product/${product.slug}`} className="button-link">
                    View Product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="section-kicker">TikTok-Style Media Feed</div>
          <h2 className="section-title">Vertical autoplay feed with event-based carousels.</h2>
          <p className="section-copy" style={{ maxWidth: 760 }}>
            Each event can now hold multiple images, native videos, and YouTube/Vimeo embeds.
          </p>
        </div>
        <div className="container" style={{ marginTop: 24 }}>
          <VerticalMediaFeed events={galleryEvents as any} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-kicker">Creator Network</div>
          <h2 className="section-title">Six high-engagement creators inside the RESURGENCE ecosystem.</h2>
          <div className="btn-row" style={{ marginTop: 18 }}>
            <Link href="/creators" className="button-link btn-secondary">
              Open Creators Directory
            </Link>
          </div>
          <div className="card-grid grid-3" style={{ marginTop: 24 }}>
            {(creators ?? []).map((creator: any) => (
              <article className="card" key={creator.id}>
                <img
                  src={creator.imageUrl || '/assets/resurgence-logo.jpg'}
                  alt={creator.name}
                  style={{ width: '100%', borderRadius: 16, marginBottom: 16, aspectRatio: '16 / 10', objectFit: 'cover' }}
                />
                <h3 style={{ marginBottom: 8 }}>{creator.name}</h3>
                <div className="helper" style={{ marginBottom: 12 }}>{creator.position || creator.roleLabel}</div>
                <p className="section-copy" style={{ fontSize: '1rem' }}>
                  {creator.shortBio || creator.biography || creator.jobDescription || creator.platformFocus}
                </p>
                <div className="helper">
                  PPG {creator.pointsPerGame ?? 0} • APG {creator.assistsPerGame ?? 0} • RPG {creator.reboundsPerGame ?? 0}
                </div>
                <div className="btn-row" style={{ marginTop: 16 }}>
                  <Link href={`/creators/${creator.slug}`} className="button-link">
                    View Full Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-kicker">Sponsor Packages</div>
          <h2 className="section-title">Updated tiers built for real sponsor conversations.</h2>
          <div className="card-grid grid-2" style={{ marginTop: 24 }}>
            {(sponsors ?? []).map((sponsor: any) => (
              <article className="card" key={sponsor.id}>
                <div className="badge">{sponsor.tier}</div>
                <h3 style={{ marginTop: 16 }}>{sponsor.name}</h3>
                <p className="section-copy" style={{ fontSize: '1rem' }}>{sponsor.shortDescription}</p>
                <strong style={{ display: 'block', fontSize: '2rem', marginTop: 12 }}>{sponsor.packageValue}</strong>
                <ul className="list-clean">
                  {safeLines(sponsor.benefits).map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="section-kicker">Partners</div>
          <h2 className="section-title">An ecosystem built on operations, media, and collaboration.</h2>
          <div className="card-grid grid-2" style={{ marginTop: 24 }}>
            {(partners ?? []).map((partner: any) => (
              <article className="card" key={partner.id}>
                <h3>{partner.name}</h3>
                <div className="helper" style={{ marginBottom: 12 }}>{partner.category}</div>
                <p className="section-copy" style={{ fontSize: '1rem' }}>{partner.shortDescription}</p>
                <ul className="list-clean">
                  {safeLines(partner.services).map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container split">
          <div>
            <div className="section-kicker">Direct Contact</div>
            <h2 className="section-title">Contact {contactName} for sponsorships, partnerships, events, and proposals.</h2>
            <p className="section-copy">
              For direct business discussions, proposal requests, and custom partnership packages, reach out using the official {brandName} contact details below.
            </p>
            <div className="btn-row" style={{ marginTop: 18 }}>
              <Link href="/contact" className="button-link">Open Contact Page</Link>
              <Link href="/login" className="button-link btn-secondary">Log-in</Link>
              <a href={`mailto:${contactEmail}`} className="button-link btn-secondary">Email Partnerships</a>
            </div>
          </div>
          <div className="panel">
            <div className="section-kicker">Official Contact Details</div>
            <div className="helper">Brand: {brandName}</div>
            <div className="helper">Website: {siteUrl}</div>
            <div className="helper">Contact Person: {contactName}</div>
            <div className="helper">Role: {contactRole}</div>
            <div className="helper">Partnerships: {contactEmail}</div>
            <div className="helper">Primary Phone: {contactPhone}</div>
            <div className="helper">Support Desk: {supportEmail} / {supportPhone}</div>
            <div className="helper">Business Hours: {businessHours}</div>
            <div className="helper">Coverage: {contactAddress}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
