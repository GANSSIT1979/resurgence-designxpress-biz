import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getSponsorshipEvent } from '@/lib/sponsorship-events';

export default async function ApplyPage({ params, searchParams }: any) {
  const { slug } = await params;
  const event = getSponsorshipEvent(slug);
  if (!event) notFound();

  const selectedPackage = searchParams?.package || '';

  return (
    <main className="section" style={{ background: '#0B0E14', color: '#F8FAFC', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 920 }}>
        <Link href={`/events/${slug}`} className="button-link btn-secondary">← Back to Event</Link>
        <div style={{ marginTop: 28 }}>
          <div className="section-kicker">Sponsor Application</div>
          <h1 className="section-title">{event.title}</h1>
          <p className="section-copy">Submit your sponsorship interest and our team will follow up with package confirmation, payment options, and activation requirements.</p>
        </div>

        <form method="POST" action="/api/sponsor/submit" className="card" style={{ marginTop: 24 }}>
          <input type="hidden" name="eventSlug" value={slug} />

          <div className="form-grid">
            <label className="field">
              <span>Company Name</span>
              <input name="companyName" placeholder="Company Name" required />
            </label>

            <label className="field">
              <span>Contact Name</span>
              <input name="contactName" placeholder="Contact Name" required />
            </label>

            <label className="field">
              <span>Email</span>
              <input name="email" type="email" placeholder="Email Address" required />
            </label>

            <label className="field">
              <span>Phone</span>
              <input name="phone" placeholder="Mobile / WhatsApp / Contact Number" />
            </label>

            <label className="field">
              <span>Website / Social Link</span>
              <input name="websiteUrl" placeholder="https://..." />
            </label>

            <label className="field">
              <span>Category</span>
              <input name="category" defaultValue="Events Sponsorship" placeholder="Events Sponsorship" />
            </label>

            <label className="field">
              <span>Package</span>
              <input name="interestedPackage" defaultValue={selectedPackage} placeholder="General Sponsorship" />
            </label>

            <label className="field">
              <span>Budget Range</span>
              <input name="budgetRange" defaultValue="To be discussed" placeholder="To be discussed" />
            </label>

            <label className="field form-span-2">
              <span>Timeline</span>
              <input name="timeline" placeholder="Preferred timing or campaign window" />
            </label>

            <label className="field form-span-2">
              <span>Message</span>
              <textarea name="message" placeholder="Tell us about your sponsorship goals, target audience, or activation ideas." rows={6} />
            </label>
          </div>

          <button type="submit" className="button-link" style={{ marginTop: 20, border: 0, cursor: 'pointer' }}>
            Submit Application
          </button>
        </form>
      </div>
    </main>
  );
}
