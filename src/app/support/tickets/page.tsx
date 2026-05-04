import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SupportTicketsPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="section-kicker">Support</div>
        <h1 className="section-title">Support Tickets</h1>
        <p className="section-copy">
          Track support requests, customer issues, sponsorship assistance, and operational follow-ups.
        </p>

        <div className="btn-row" style={{ marginTop: 20 }}>
          <Link href="/support" className="button-link">
            Support Home
          </Link>
          <Link href="/contact" className="button-link btn-secondary">
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
