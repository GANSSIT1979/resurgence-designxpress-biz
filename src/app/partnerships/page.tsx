import Link from 'next/link';
import { InquiryForm } from '@/components/forms/inquiry-form';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const partnershipTracks = [
  {
    title: 'Brand and sponsorship activations',
    body:
      'Start conversations around sponsorship packages, on-ground visibility, digital campaigns, and creator-supported brand presence.',
    ctaHref: '/sponsors',
    ctaLabel: 'View sponsor packages',
  },
  {
    title: 'Affiliate and referral collaborations',
    body:
      'Use a single business entry point for referral-led partnerships, campaign support, and structured collaboration planning.',
    ctaHref: '/contact',
    ctaLabel: 'Start a business inquiry',
  },
  {
    title: 'Merchandise and apparel programs',
    body:
      'For custom uniforms, team apparel, and merch-driven campaigns, continue into the official shop flow and route larger needs for follow-up.',
    ctaHref: '/shop',
    ctaLabel: 'Open the shop',
  },
];

const routingRules = [
  'Partnership discussions are routed through the official business contact and inquiry workflow.',
  'Customer service, order follow-up, and platform help stay on the support desk so requests reach the right team faster.',
  'Storefront browsing and product-led purchasing stay in the shop, while larger commercial requests can still be escalated from there.',
  'Pricing, approvals, timelines, and custom commitments are confirmed by a human team member when needed.',
];

function toTelHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export default async function PartnershipsPage() {
  const settings = await getPublicSettings();

  return (
    <main className="section">
      <div className="container split">
        <div>
          <div className="section-kicker">Public Partnerships</div>
          <h1 className="section-title">A clean business landing page for collaborations, affiliates, and brand conversations.</h1>
          <p className="section-copy">
            {settings.brandName} keeps customer support, storefront activity, and business development on separate paths.
            Use this page when the conversation is about sponsorships, partnerships, referrals, branded programs, or
            custom commercial collaboration with {settings.companyName}.
          </p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/contact" className="button-link">Open contact intake</Link>
            <a href={`mailto:${settings.contactEmail}`} className="button-link btn-secondary">Email partnerships</a>
            <a href={toTelHref(settings.contactPhone)} className="button-link btn-secondary">Call business line</a>
          </div>
        </div>

        <div className="panel">
          <div className="section-kicker">Business Contact</div>
          <h2 style={{ marginTop: 0 }}>Official partnership routing</h2>
          <div className="helper">Contact: {settings.contactName}</div>
          <div className="helper">Role: {settings.contactRole}</div>
          <div className="helper">Email: {settings.contactEmail}</div>
          <div className="helper">Phone: {settings.contactPhone}</div>
          <div className="helper">Business Hours: {settings.businessHours}</div>
          <div className="helper">Location: {settings.location}</div>
          <div className="helper">Website: {settings.siteUrl}</div>
          <div className="btn-row" style={{ marginTop: 18 }}>
            <Link href="/support" className="button-link btn-secondary">Need support instead?</Link>
            <Link href="/shop" className="button-link btn-secondary">Browse merch</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 28 }}>
        <div className="section-kicker">Partnership Paths</div>
        <h2 className="section-title">Choose the route that fits the conversation.</h2>
        <div className="card-grid grid-3" style={{ marginTop: 24 }}>
          {partnershipTracks.map((track) => (
            <article className="card" key={track.title}>
              <h3>{track.title}</h3>
              <p className="section-copy" style={{ fontSize: '1rem' }}>{track.body}</p>
              <Link href={track.ctaHref} className="button-link btn-secondary">
                {track.ctaLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="container card-grid grid-2" style={{ marginTop: 28 }}>
        <section className="card">
          <div className="section-kicker">Business Inquiry</div>
          <h2 style={{ marginTop: 0 }}>Start a formal partnership conversation.</h2>
          <p className="helper">
            Use this form for sponsorships, affiliate opportunities, event collaborations, media partnerships, and
            larger custom programs that need review from the business team.
          </p>
          <div style={{ marginTop: 20 }}>
            <InquiryForm />
          </div>
        </section>

        <section className="card">
          <div className="section-kicker">Routing Rules</div>
          <h2 style={{ marginTop: 0 }}>Clear separation between business, support, and commerce.</h2>
          <ul className="list-clean">
            {routingRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <div className="panel" style={{ marginTop: 20 }}>
            <div className="section-kicker">Helpful Links</div>
            <div className="helper">Support desk: {settings.supportEmail} / {settings.supportPhone}</div>
            <div className="helper">Business line: {settings.contactEmail} / {settings.contactPhone}</div>
            <div className="helper">Storefront: {settings.siteUrl.replace(/\/$/, '')}/shop</div>
          </div>
        </section>
      </div>
    </main>
  );
}
