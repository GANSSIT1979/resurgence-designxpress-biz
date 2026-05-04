import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getSponsorshipEvent } from '@/lib/sponsorship-events';

export default async function ApplyPage({ params, searchParams }: any) {
  const { slug } = await params;
  const event = getSponsorshipEvent(slug);
  if (!event) notFound();

  const selectedPackage = searchParams?.package || '';

  return (
    <main style={{ background: '#0B0E14', color: '#F8FAFC', minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href={`/events/${slug}`} style={{ color: '#D4AF37' }}>← Back to Event</Link>
        <h1 style={{ color: '#D4AF37' }}>{event.title}</h1>
        <p>Apply as a sponsor for this event.</p>

        <form method="POST" action="/api/sponsor/submit">
          <input type="hidden" name="eventSlug" value={slug} />

          <input name="companyName" placeholder="Company Name" required />
          <input name="contactName" placeholder="Contact Name" required />
          <input name="email" placeholder="Email" required />

          <input name="interestedPackage" defaultValue={selectedPackage} placeholder="Package" />

          <textarea name="message" placeholder="Message" />

          <button type="submit">Submit Application</button>
        </form>
      </div>
    </main>
  );
}
