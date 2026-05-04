import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import {
  getEventScheduleLabel,
  getSponsorshipEvent,
} from '@/lib/sponsorship-events';

export const dynamic = 'force-dynamic';

type EventPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getSponsorshipEvent(slug);

  return {
    title: event ? `${event.title} | RESURGENCE` : 'Event Sponsorship | RESURGENCE',
    description: event?.heroSubtitle || 'RESURGENCE sponsorship event platform.',
  };
}

export default async function EventLandingPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getSponsorshipEvent(slug);
  if (!event) notFound();

  const packages = await prisma.sponsorPackageTemplate.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const highlights = [
    { label: 'Schedule', value: getEventScheduleLabel(event) },
    { label: 'Market', value: event.market },
    { label: 'Organizer', value: event.organizer },
  ].filter((item) => item.value);

  return (
    <main style={{ background: '#0B0E14', color: '#F8FAFC', minHeight: '100vh' }}>
      <section style={{ padding: '88px 24px 64px', background: 'linear-gradient(90deg, rgba(11,14,20,0.98), rgba(230,57,70,0.18))' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <p style={{ color: '#E63946', letterSpacing: 4, textTransform: 'uppercase', fontWeight: 900 }}>{event.heroKicker}</p>
          <h1 style={{ color: '#D4AF37', fontSize: 'clamp(3.2rem, 8vw, 7rem)', lineHeight: 0.92, margin: '16px 0', textTransform: 'uppercase' }}>{event.title}</h1>
          <p style={{ borderLeft: '5px solid #E63946', paddingLeft: 20, fontSize: 23, maxWidth: 760 }}>{event.heroSubtitle}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 32 }}>
            {highlights.map((item) => (
              <div key={item.label} style={{ background: '#1A1F2B', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 14, padding: '16px 18px', minWidth: 210 }}>
                <div style={{ color: '#D4AF37', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 34 }}>
            <Link href={`/events/${event.slug}/apply`} style={{ color: '#0B0E14', background: '#D4AF37', padding: '14px 20px', borderRadius: 999, fontWeight: 900, textDecoration: 'none' }}>Apply as Sponsor</Link>
            <Link href="#packages" style={{ color: '#F8FAFC', border: '1px solid #D4AF37', padding: '14px 20px', borderRadius: 999, fontWeight: 800, textDecoration: 'none' }}>View Packages</Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ borderLeft: '6px solid #E63946', paddingLeft: 20, marginBottom: 28 }}>
          <h2 style={{ color: '#D4AF37', fontSize: 44, margin: 0, textTransform: 'uppercase' }}>Event Overview</h2>
          <p style={{ letterSpacing: 3, textTransform: 'uppercase', fontSize: 13 }}>{event.overviewTitle}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <article style={{ background: '#1A1F2B', borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: '#D4AF37', marginTop: 0 }}>Why this event matters</h3>
            <p style={{ lineHeight: 1.7 }}>{event.overviewCopy}</p>
          </article>
          <article style={{ background: '#1A1F2B', borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: '#D4AF37', marginTop: 0 }}>Core Objectives</h3>
            <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
              {event.objectives.map((objective) => <li key={objective}>{objective}</li>)}
            </ul>
          </article>
        </div>
      </section>

      {event.schedule.length > 0 ? (
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 24px 56px' }}>
          <h2 style={{ color: '#D4AF37', fontSize: 44, textTransform: 'uppercase' }}>Event Schedule</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {event.schedule.map((item) => (
              <article key={item.label} style={{ background: '#1A1F2B', borderRadius: 16, border: '1px solid rgba(212,175,55,0.25)', padding: 24 }}>
                <h3 style={{ color: '#D4AF37', marginTop: 0 }}>{item.label}</h3>
                <p style={{ lineHeight: 1.7 }}>{[item.date, item.time, item.location].filter(Boolean).join(' · ')}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section id="packages" style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 24px 72px' }}>
        <h2 style={{ color: '#D4AF37', fontSize: 44, textTransform: 'uppercase' }}>Sponsorship Packages</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {packages.map((pkg) => (
            <article key={pkg.id} style={{ background: '#1A1F2B', borderRadius: 16, borderTop: '5px solid #D4AF37', padding: 24 }}>
              <p style={{ color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }}>{pkg.tier} · {pkg.rangeLabel}</p>
              <h3 style={{ fontSize: 30, margin: 0 }}>{pkg.name}</h3>
              <p style={{ lineHeight: 1.65 }}>{pkg.summary}</p>
              <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
                {pkg.benefits.split('\n').filter(Boolean).map((benefit) => <li key={benefit}>{benefit}</li>)}
              </ul>
              <Link href={`/events/${event.slug}/apply?package=${encodeURIComponent(pkg.name)}`} style={{ display: 'inline-block', marginTop: 10, color: '#0B0E14', background: '#D4AF37', padding: '11px 16px', borderRadius: 999, fontWeight: 800, textDecoration: 'none' }}>Select Package</Link>
            </article>
          ))}
          {packages.length === 0 ? <p>No active sponsor packages configured yet.</p> : null}
        </div>
      </section>
    </main>
  );
}
