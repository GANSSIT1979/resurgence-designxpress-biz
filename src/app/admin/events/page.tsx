import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { getDefaultSponsorshipEvent, sponsorshipEvents } from '@/lib/sponsorship-events';

export const dynamic = 'force-dynamic';

function normalizeEventSlug(submission: any) {
  return submission.eventSlug || getDefaultSponsorshipEvent().slug;
}

export default async function AdminEventsPage() {
  const submissions = await prisma.sponsorSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const eventRows = sponsorshipEvents.map((event) => {
    const eventSubmissions = submissions.filter((submission: any) => normalizeEventSlug(submission) === event.slug);
    const approved = eventSubmissions.filter((submission) => submission.status === 'APPROVED').length;
    const converted = eventSubmissions.filter((submission) => submission.status === 'CONVERTED_TO_ACTIVE_SPONSOR').length;
    const underReview = eventSubmissions.filter((submission) => submission.status === 'UNDER_REVIEW').length;

    return {
      event,
      total: eventSubmissions.length,
      approved,
      converted,
      underReview,
    };
  });

  const totals = eventRows.reduce(
    (acc, row) => ({
      events: acc.events + 1,
      leads: acc.leads + row.total,
      approved: acc.approved + row.approved,
      converted: acc.converted + row.converted,
    }),
    { events: 0, leads: 0, approved: 0, converted: 0 },
  );

  return (
    <main style={{ background: '#0B0E14', color: '#F8FAFC', minHeight: '100vh', padding: 24 }}>
      <section style={{ maxWidth: 1180, margin: '0 auto' }}>
        <p style={{ color: '#E63946', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 900 }}>Admin Platform</p>
        <h1 style={{ color: '#D4AF37', fontSize: 'clamp(2.5rem, 6vw, 4.8rem)', margin: '8px 0' }}>Multi-Event Sponsorship Dashboard</h1>
        <p style={{ maxWidth: 760, lineHeight: 1.7 }}>
          Manage sponsorship funnels across events, monitor lead volume, and jump into event-specific landing pages, applications, CRM, proposals, and revenue workflows.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginTop: 28 }}>
          <Stat label="Events" value={totals.events} />
          <Stat label="Total Leads" value={totals.leads} />
          <Stat label="Approved" value={totals.approved} />
          <Stat label="Converted" value={totals.converted} />
        </div>

        <section style={{ marginTop: 28, display: 'grid', gap: 18 }}>
          {eventRows.map((row) => (
            <article key={row.event.slug} style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 20, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, fontWeight: 900 }}>{row.event.market}</p>
                  <h2 style={{ margin: 0 }}>{row.event.title}</h2>
                  <p style={{ marginBottom: 0 }}>{row.event.eventDate} · {row.event.organizer}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <MiniStat label="Leads" value={row.total} />
                  <MiniStat label="Review" value={row.underReview} />
                  <MiniStat label="Approved" value={row.approved} />
                  <MiniStat label="Converted" value={row.converted} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
                <Action href={`/events/${row.event.slug}`} label="Open Landing" />
                <Action href={`/events/${row.event.slug}/apply`} label="Open Apply" />
                <Action href={`/admin/sponsor-crm?event=${row.event.slug}`} label="Sponsor CRM" />
                <Action href={`/admin/events/${row.event.slug}/crm`} label="Event CRM" />
              </div>
            </article>
          ))}
        </section>
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#0F172A', borderRadius: 14, padding: '10px 14px', minWidth: 94 }}>
      <div style={{ color: '#D4AF37', fontSize: 11, textTransform: 'uppercase' }}>{label}</div>
      <strong>{value}</strong>
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
