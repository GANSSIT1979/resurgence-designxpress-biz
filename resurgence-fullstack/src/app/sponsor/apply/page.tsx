import Link from 'next/link';
import { SponsorApplicationForm } from '@/components/forms/sponsor-application-form';

export const dynamic = 'force-dynamic';

export default function SponsorApplyPage() {
  const contactName = process.env.NEXT_PUBLIC_CONTACT_NAME || 'Jake Anilao';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'resurgence.dx@gmail.com';
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+63 938 784 1636';

  return (
    <main className="section">
      <div className="container split">
        <div>
          <div className="section-kicker">Sponsor Application</div>
          <h1 className="section-title">Apply to sponsor RESURGENCE Powered by DesignXpress</h1>
          <p className="section-copy">
            The application form now matches the 2026 sponsorship deck with standardized package names, aligned budget ranges, and inventory-aware sponsorship positioning.
          </p>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="section-kicker">Current package tiers</div>
            <ul className="list-clean">
              <li>Supporting Sponsor — PHP 15,000–50,000</li>
              <li>Official Brand Partner — PHP 75,000–95,000</li>
              <li>Major Partner — PHP 120,000–150,000</li>
              <li>Event Presenting — Custom Proposal</li>
            </ul>
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="section-kicker">Direct Contact</div>
            <div className="helper">Contact: {contactName}</div>
            <div className="helper">Email: {contactEmail}</div>
            <div className="helper">Phone: {contactPhone}</div>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <Link className="button-link" href="/sponsors">View sponsor packages</Link>
              <Link className="button-link btn-secondary" href="/contact">General inquiry</Link>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="section-kicker">What happens next</div>
            <ul className="list-clean">
              <li>We review your selected package tier and campaign goals.</li>
              <li>We align deliverables across branding, digital, on-ground, and commercial support.</li>
              <li>We update your status through the sponsor review workflow.</li>
              <li>We prepare agreement, billing, and onboarding requirements for approved sponsors.</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="section-kicker">Submit Your Details</div>
          <h2 style={{ marginBottom: 12 }}>Sponsor submission workflow</h2>
          <SponsorApplicationForm />
        </div>
      </div>
    </main>
  );
}
