import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DAYO Series OFW All-Star 2026 | RESURGENCE',
  description:
    'DAYO Series OFW All-Star 2026 sponsorship and team presentation for Hong Kong and Macau basketball communities.',
};

const highlights = [
  { label: 'Event Date', value: 'April 30, 2026' },
  { label: 'Market', value: 'Hong Kong & Macau' },
  { label: 'Organizer', value: 'AMMOS 2014 Hong Kong' },
];

const objectives = [
  'Unite OFW basketball communities through a premium all-star event.',
  'Create sponsor-ready exposure across teams, jerseys, courtside assets, and content.',
  'Build a repeatable sports activation model for RESURGENCE partners.',
];

const sponsorshipTiers = [
  {
    name: 'Title Partner',
    tagline: 'Premier naming-rights visibility',
    border: '#D4AF37',
    benefits: [
      'Primary event naming and headline placement',
      'Dominant jersey, court, and social content visibility',
      'VIP recognition during opening and awarding moments',
      'Priority inclusion in recap videos and sponsor reports',
    ],
  },
  {
    name: 'Gold Sponsor',
    tagline: 'High-impact brand exposure',
    border: '#F1F1F1',
    benefits: [
      'Logo placement on digital posters and event materials',
      'Featured brand mentions across promotional content',
      'Booth or activation area subject to venue layout',
      'Post-event performance and exposure summary',
    ],
  },
  {
    name: 'Community Sponsor',
    tagline: 'Grassroots support package',
    border: '#E63946',
    benefits: [
      'Supporting sponsor recognition',
      'Inclusion in partner thank-you posts',
      'Community goodwill positioning with OFW athletes',
      'Optional product or voucher contribution mechanics',
    ],
  },
];

export default function DayoSeriesOfwAllStarPage() {
  return (
    <main style={{ background: '#0B0E14', color: '#F1F1F1', minHeight: '100vh' }}>
      <section
        style={{
          padding: '88px 24px 64px',
          background:
            'linear-gradient(90deg, rgba(11,14,20,0.98) 0%, rgba(11,14,20,0.88) 45%, rgba(230,57,70,0.20) 100%)',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <p style={{ color: '#E63946', letterSpacing: 4, textTransform: 'uppercase', fontWeight: 800 }}>
            AMMOS 2014 Hong Kong Presents
          </p>
          <h1
            style={{
              color: '#D4AF37',
              fontSize: 'clamp(3.5rem, 9vw, 8rem)',
              lineHeight: 0.9,
              margin: '16px 0',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            DAYO Series<br />OFW All-Star 2026
          </h1>
          <p style={{ borderLeft: '5px solid #E63946', paddingLeft: 20, fontSize: 24, maxWidth: 760 }}>
            Comprehensive sponsorship and team presentation for one court, one dream, and one champion.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 36 }}>
            {highlights.map((item) => (
              <div
                key={item.label}
                style={{
                  background: '#1A1F2B',
                  border: '1px solid rgba(212,175,55,0.25)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  minWidth: 210,
                }}
              >
                <div style={{ color: '#D4AF37', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {item.label}
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ borderLeft: '6px solid #E63946', paddingLeft: 20, marginBottom: 28 }}>
          <h2 style={{ color: '#D4AF37', fontSize: 44, margin: 0, textTransform: 'uppercase' }}>Event Overview</h2>
          <p style={{ letterSpacing: 3, textTransform: 'uppercase', fontSize: 13 }}>OFW basketball community activation</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <article style={{ background: '#1A1F2B', borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: '#D4AF37', marginTop: 0 }}>Why this event matters</h3>
            <p style={{ lineHeight: 1.7 }}>
              DAYO Series OFW All-Star 2026 positions basketball as a cultural bridge for Filipino workers,
              athletes, families, and sponsor brands across Hong Kong and Macau.
            </p>
          </article>
          <article style={{ background: '#1A1F2B', borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: '#D4AF37', marginTop: 0 }}>Core Objectives</h3>
            <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
              {objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 24px 72px' }}>
        <div style={{ borderLeft: '6px solid #E63946', paddingLeft: 20, marginBottom: 28 }}>
          <h2 style={{ color: '#D4AF37', fontSize: 44, margin: 0, textTransform: 'uppercase' }}>
            Sponsorship Tiers
          </h2>
          <p style={{ letterSpacing: 3, textTransform: 'uppercase', fontSize: 13 }}>Packages designed for visibility and conversion</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {sponsorshipTiers.map((tier) => (
            <article
              key={tier.name}
              style={{
                background: '#1A1F2B',
                borderRadius: 16,
                borderTop: `5px solid ${tier.border}`,
                padding: 24,
                boxShadow: '0 18px 44px rgba(0,0,0,0.28)',
              }}
            >
              <h3 style={{ fontSize: 30, margin: 0, color: '#F1F1F1' }}>{tier.name}</h3>
              <p style={{ color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }}>
                {tier.tagline}
              </p>
              <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                {tier.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div
          style={{
            marginTop: 28,
            padding: 22,
            border: '1px dashed #E63946',
            background: 'rgba(230,57,70,0.10)',
            borderRadius: 16,
            textAlign: 'center',
          }}
        >
          <strong style={{ fontSize: 24 }}>Ready for sponsor onboarding and proposal conversion.</strong>
          <p style={{ color: '#D4AF37', marginBottom: 0 }}>
            Connect this page to sponsor applications, checkout packages, and partner deliverables inside RESURGENCE.
          </p>
          <div style={{ marginTop: 18 }}>
            <Link href="/sponsor/packages" style={{ color: '#0B0E14', background: '#D4AF37', padding: '12px 18px', borderRadius: 999, fontWeight: 800, textDecoration: 'none' }}>
              View Sponsor Packages
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
