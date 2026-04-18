import Link from 'next/link';
import { SponsorApplicationForm } from '@/components/forms/sponsor-application-form';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function SponsorApplyPage() {
  const settings = await getPublicSettings();

  return (
    <main className="section">
      <div className="container split">
        <div>
          <div className="section-kicker">Sponsor Application</div>
          <h1 className="section-title">Apply to sponsor {settings.brandName}</h1>
          <p className="section-copy">
            The application form matches the current sponsorship workflow with standardized package names,
            aligned budget ranges, and inventory-aware sponsor positioning.
          </p>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="section-kicker">Business Profile</div>
            <div className="helper">Company: {settings.companyName}</div>
            <div className="helper">Website: {settings.siteUrl}</div>
            <div className="helper">Location: {settings.location}</div>
            <div className="helper">Currency: {settings.currency}</div>
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="section-kicker">Current package tiers</div>
            <ul className="list-clean">
              <li>Supporting Sponsor - PHP 15,000-50,000</li>
              <li>Official Brand Partner - PHP 75,000-95,000</li>
              <li>Major Partner - PHP 120,000-150,000</li>
              <li>Event Presenting - Custom Proposal</li>
            </ul>
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="section-kicker">Direct Contact</div>
            <div className="helper">Contact: {settings.contactName}</div>
            <div className="helper">Role: {settings.contactRole}</div>
            <div className="helper">Email: {settings.contactEmail}</div>
            <div className="helper">Phone: {settings.contactPhone}</div>
            <div className="helper">Support: {settings.supportEmail} / {settings.supportPhone}</div>
            <div className="helper">Business Hours: {settings.businessHours}</div>
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
