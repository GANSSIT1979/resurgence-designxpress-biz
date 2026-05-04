import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getDefaultSponsorshipEvent, getSponsorshipEvent } from '@/lib/sponsorship-events';
import { EventCrmKanban } from '@/components/event-crm-kanban';

export const dynamic = 'force-dynamic';

function normalizeEventSlug(submission: any) {
  return submission.eventSlug || getDefaultSponsorshipEvent().slug;
}

export default async function EventCrmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getSponsorshipEvent(slug);
  if (!event) notFound();

  const allSubmissions = await prisma.sponsorSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const submissions = allSubmissions
    .filter((submission: any) => normalizeEventSlug(submission) === slug)
    .map((item) => ({
      id: item.id,
      companyName: item.companyName,
      contactName: item.contactName,
      email: item.email,
      interestedPackage: item.interestedPackage,
      status: item.status,
    }));

  const stats = {
    total: submissions.length,
    approved: submissions.filter((item) => item.status === 'APPROVED').length,
    review: submissions.filter((item) => item.status === 'UNDER_REVIEW').length,
    converted: submissions.filter((item) => item.status === 'CONVERTED_TO_ACTIVE_SPONSOR').length,
  };

  return (
    <main style={{ background: '#0B0E14', color: '#F8FAFC', minHeight: '100vh', padding: 24 }}>
      <section style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <Link href="/admin/events" style={{ color: '#D4AF37', fontWeight: 800, textDecoration: 'none' }}>← Back to Events</Link>
            <p style={{ color: '#E63946', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 900, marginTop: 20 }}>Event CRM Pipeline</p>
            <h1 style={{ color: '#D4AF37', fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', margin: '8px 0' }}>{event.title}</h1>
            <p>{event.market} · {event.eventDate} · {event.organizer}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'start' }}>
            <Action href={`/events/${event.slug}`} label="Landing" />
            <Action href={`/events/${event.slug}/apply`} label="Apply" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 28 }}>
          <Stat label="Total Leads" value={stats.total} />
          <Stat label="Under Review" value={stats.review} />
          <Stat label="Approved" value={stats.approved} />
          <Stat label="Converted" value={stats.converted} />
        </div>

        <EventCrmKanban initialLeads={submissions} />
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 16, padding: 18 }}>
      <div style={{ color: '#D4AF37', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <strong style={{ fontSize: 32 }}>{value}</strong>
    </div>
  );
}

function Action({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{ color: '#0B0E14', background: '#D4AF37', borderRadius: 999, padding: '10px 14px', fontWeight: 900, textDecoration: 'none' }}>
      {label}
    </Link>
  );
}
