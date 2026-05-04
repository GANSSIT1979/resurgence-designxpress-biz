import Link from 'next/link';

export default function SponsorThankYouPage() {
  return (
    <main style={{ minHeight: '70vh', padding: '72px 24px' }}>
      <section style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ color: '#D4AF37', fontWeight: 700 }}>
          Sponsorship Application Submitted
        </p>

        <h1>Thank you for applying as a RESURGENCE sponsor.</h1>

        <p>
          We received your sponsorship application. Our team will review your
          details and follow up with the next steps.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <Link href="/events">Back to Events</Link>
          <Link href="/sponsors">View Sponsorships</Link>
        </div>
      </section>
    </main>
  );
}
