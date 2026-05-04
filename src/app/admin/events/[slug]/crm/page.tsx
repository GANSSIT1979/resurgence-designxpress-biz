import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getDefaultSponsorshipEvent, getSponsorshipEvent } from '@/lib/sponsorship-events';

export const dynamic = 'force-dynamic';

const statuses = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_REVISION',
  'APPROVED',
  'REJECTED',
  'CONVERTED_TO_ACTIVE_SPONSOR',
] as const;

const labels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  NEEDS_REVISION: 'Needs Revision',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CONVERTED_TO_ACTIVE_SPONSOR: 'Converted',
};

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

  const submissions = allSubmissions.filter((submission: any) => normalizeEventSlug(submission) === slug);
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

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 28, alignItems: 'start' }}>
          {statuses.map((status) => {
            const items = submissions.filter((submission) => submission.status === status);
            return (
              <div key={status} style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 18, padding: 16 }}>
                <h2 style={{ marginTop: 0 }}>{labels[status]}</h2>
                <p style={{ color: '#D4AF37', fontWeight: 900 }}>{items.length} lead(s)</p>
                <div style={{ display: 'grid', gap: 12 }}>
                  {items.map((item) => (
                    <article key={item.id} style={{ background: '#0F172A', borderRadius: 16, padding: 14 }}>
                      <strong>{item.companyName}</strong>
                      <p style={{ margin: '6px 0' }}>{item.contactName}</p>
                      <p style={{ color: '#94A3B8', margin: '6px 0' }}>{item.email}</p>
                      <p style={{ color: '#D4AF37', margin: '6px 0' }}>{item.interestedPackage}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        <Action href={`/admin/sponsor-crm/proposal/${item.id}`} label="Proposal" small />
                        <Action href={`/api/admin/sponsor-crm/${item.id}/status?status=UNDER_REVIEW`} label="Review" small />
                        <Action href={`/api/admin/sponsor-crm/${item.id}/status?status=APPROVED`} label="Approve" small />
                        <Action href={`/api/admin/sponsor-crm/${item.id}/status?status=CONVERTED_TO_ACTIVE_SPONSOR`} label="Convert" small />
                      </div>
                    </article>
                  ))}
                  {items.length === 0 ? <p style={{ color: '#94A3B8' }}>No leads in this stage.</p> : null}
                </div>
              </div>
            );
          })}
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

function Action({ href, label, small = false }: { href: string; label: string; small?: boolean }) {
  return (
    <Link href={href} style={{ color: '#0B0E14', background: '#D4AF37', borderRadius: 999, padding: small ? '7px 10px' : '10px 14px', fontWeight: 900, textDecoration: 'none', fontSize: small ? 12 : 14 }}>
      {label}
    </Link>
  );
}
