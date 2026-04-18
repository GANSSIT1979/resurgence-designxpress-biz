import Link from 'next/link';
import { getFeaturedShopProducts, getHomeData, getProductServices } from '@/lib/site';
import { getPublicSettings } from '@/lib/settings';
import { VerticalMediaFeed } from '@/components/vertical-media-feed';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [{ contentMap, sponsors, partners, stats, creators, inventoryCategories, galleryEvents }, services, settings, shopProducts] = await Promise.all([getHomeData(), getProductServices(), getPublicSettings(), getFeaturedShopProducts(4)]);
  const hero = contentMap['home.hero'];
  const about = contentMap['home.about'];
  const brandName = settings.brandName;
  const siteUrl = settings.siteUrl;
  const contactName = settings.contactName;
  const contactRole = settings.contactRole;
  const contactEmail = settings.contactEmail;
  const contactPhone = settings.contactPhone;
  const supportEmail = settings.supportEmail;
  const supportPhone = settings.supportPhone;
  const businessHours = settings.businessHours;
  const contactAddress = settings.contactAddress;

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="badge">{hero.subtitle}</span>
            <h1 className="hero-title">{hero.title}</h1>
            <p className="hero-copy">{hero.body}</p>
            <div className="btn-row" style={{ marginTop: 22 }}>
              <Link href={hero.ctaHref || '/sponsor/apply'} className="button-link">{hero.ctaLabel || 'Apply as Sponsor'}</Link>
              <Link href="/sponsors" className="button-link btn-secondary">View Sponsor Packages</Link>
            </div>
            <div className="stat-grid">
              {stats.map((stat) => (
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
              <h3 style={{ fontSize: '1.7rem', marginBottom: 0 }}>A premium sports and creator platform built for sponsor visibility, engagement, and commercial activation.</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <div className="section-kicker">{about.subtitle}</div>
            <h2 className="section-title">{about.title}</h2>
            <p className="section-copy">{about.body}</p>
            <div className="btn-row" style={{ marginTop: 18 }}>
              <Link href={about.ctaHref || '/sponsors'} className="button-link">{about.ctaLabel || 'View Sponsor Packages'}</Link>
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
          <p className="section-copy" style={{ maxWidth: 760 }}>The updated platform now presents sponsor opportunities through inventory sections that map directly to the 2026 proposal deck.</p>
          <div className="feature-row" style={{ marginTop: 24 }}>
            {services.map((service) => (
              <article className="card" key={service.id || service.name}>
                <h3>{service.name}</h3>
                <p className="section-copy" style={{ fontSize: '1rem' }}>{service.description}</p>
              </article>
            ))}
          </div>
          <div className="card-grid grid-2" style={{ marginTop: 20 }}>
            {inventoryCategories.map((item) => (
              <article className="card" key={item.id}>
                <div className="section-kicker">{item.name}</div>
                <p className="section-copy" style={{ fontSize: '1rem' }}>{item.description}</p>
                <ul className="list-clean">
                  {item.examples.split('\n').map((example) => (
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
          <div className="section-kicker">Featured Merch</div>
          <h2 className="section-title">Official shop now live inside Resurgence.</h2>
          <p className="section-copy" style={{ maxWidth: 760 }}>Launch jerseys, caps, shirts, hoodies, tumblers, and future drops from the same live platform that powers your sponsorship and creator workflows.</p>
          <div className="card-grid grid-4" style={{ marginTop: 24 }}>
            {shopProducts.map((product: any) => (
              <article className="card" key={product.id}>
                <img src={product.imageUrl || '/assets/resurgence-poster.jpg'} alt={product.name} style={{ width: '100%', borderRadius: 18, aspectRatio: '16 / 10', objectFit: 'cover', marginBottom: 16 }} />
                <div className="helper">{product.category?.name || 'Official Merch'}</div>
                <h3 style={{ marginBottom: 8 }}>{product.name}</h3>
                <p className="helper">₱{product.price.toLocaleString()}</p>
                <div className="btn-row" style={{ marginTop: 16 }}>
                  <Link href={`/shop/product/${product.slug}`} className="button-link">View Product</Link>
                </div>
              </article>
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: 18 }}>
            <Link href="/shop" className="button-link">Open Shop</Link>
            <Link href="/cart" className="button-link btn-secondary">View Cart</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="section-kicker">TikTok-Style Media Feed</div>
          <h2 className="section-title">Vertical autoplay feed with event-based carousels.</h2>
          <p className="section-copy" style={{ maxWidth: 760 }}>Each event can now hold multiple images, native videos, and YouTube/Vimeo embeds. Scroll the mobile-first feed to experience creator-led highlights in a high-retention format.</p>
        </div>
        <div className="container" style={{ marginTop: 24 }}>
          <VerticalMediaFeed events={galleryEvents as any} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-kicker">Creator Network</div>
          <h2 className="section-title">Six high-engagement creators inside the RESURGENCE ecosystem.</h2>
          <div className="card-grid grid-3" style={{ marginTop: 24 }}>
            {creators.map((creator: any) => (
              <article className="card" key={creator.id}>
                <img src={creator.imageUrl || '/assets/resurgence-logo.jpg'} alt={creator.name} style={{ width: '100%', borderRadius: 16, marginBottom: 16, aspectRatio: '16 / 10', objectFit: 'cover' }} />
                <h3 style={{ marginBottom: 8 }}>{creator.name}</h3>
                <div className="helper" style={{ marginBottom: 12 }}>{creator.roleLabel}</div>
                <p className="section-copy" style={{ fontSize: '1rem' }}>{creator.biography || creator.platformFocus}</p>
                <div className="helper">PPG {creator.pointsPerGame ?? 0} • APG {creator.assistsPerGame ?? 0} • RPG {creator.reboundsPerGame ?? 0}</div>
                <div className="btn-row" style={{ marginTop: 16 }}>
                  <Link href={`/creator/${creator.slug}`} className="button-link">View Dashboard</Link>
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
            {sponsors.map((sponsor) => (
              <article className="card" key={sponsor.id}>
                <div className="badge">{sponsor.tier}</div>
                <h3 style={{ marginTop: 16 }}>{sponsor.name}</h3>
                <p className="section-copy" style={{ fontSize: '1rem' }}>{sponsor.shortDescription}</p>
                <strong style={{ display: 'block', fontSize: '2rem', marginTop: 12 }}>{sponsor.packageValue}</strong>
                <ul className="list-clean">
                  {sponsor.benefits.split('\n').map((benefit) => (
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
            {partners.map((partner) => (
              <article className="card" key={partner.id}>
                <h3>{partner.name}</h3>
                <div className="helper" style={{ marginBottom: 12 }}>{partner.category}</div>
                <p className="section-copy" style={{ fontSize: '1rem' }}>{partner.shortDescription}</p>
                <ul className="list-clean">
                  {partner.services.split('\n').map((service) => (
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
            <p className="section-copy">For direct business discussions, proposal requests, and custom partnership packages, reach out using the official {brandName} contact details below.</p>
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
