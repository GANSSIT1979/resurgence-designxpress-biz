import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terms Of Service | RESURGENCE',
  description: 'Basic terms for use of the RESURGENCE Powered by DesignXpress platform.',
};

const updatedLabel = 'April 22, 2026';

const termSections = [
  {
    title: 'Platform Use',
    points: [
      'By creating an account or using this platform, you agree to use the service only for lawful, accurate, and authorized participation in RESURGENCE activities and related business workflows.',
      'You are responsible for the information you submit and for keeping your login credentials, verification steps, and account access under your control.',
    ],
  },
  {
    title: 'Role-Based Access',
    points: [
      'The platform uses role-based dashboards and permissions for members, coaches, partners, sponsors, admins, and other supported users.',
      'You must not attempt to bypass permissions, access restricted areas without authorization, or use another person\'s account, data, or workflow.',
    ],
  },
  {
    title: 'Quotes, Orders, Sponsorships, And Approvals',
    points: [
      'Product availability, quotations, sponsorship packages, partnership terms, production schedules, and delivery commitments are subject to official review and confirmation by the team.',
      'Content shown on the platform does not automatically guarantee stock, approval, pricing, timelines, or commercial acceptance unless confirmed through the appropriate business process.',
    ],
  },
  {
    title: 'Content And Conduct',
    points: [
      'You must not submit unlawful, abusive, fraudulent, misleading, infringing, or harmful content through forms, uploads, profiles, or communication features.',
      'We may limit, suspend, or review access when needed to protect users, business operations, data integrity, or platform security.',
    ],
  },
  {
    title: 'Service Availability',
    points: [
      'Platform features may change, be updated, or be temporarily unavailable due to maintenance, security work, deployment changes, or operational decisions.',
      'We may refine workflows, forms, dashboards, and support channels as the platform evolves.',
    ],
  },
  {
    title: 'Contact And Updates',
    points: [
      'Questions about these terms should be directed to the official RESURGENCE support or contact channels listed on this site.',
      'These terms may be updated as the platform, services, or compliance needs change.',
    ],
  },
];

export default async function TermsPage() {
  const settings = await getPublicSettings();

  return (
    <main className="section">
      <div className="container split">
        <div>
          <div className="section-kicker">Terms Of Service</div>
          <h1 className="section-title">Basic conditions for using {settings.brandName}.</h1>
          <p className="section-copy">
            These terms provide a simple operating framework for platform access, free registration, role-based use, and commercial workflows handled through
            {' '}{settings.brandName}.
          </p>
          <div className="helper">Last updated: {updatedLabel}</div>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/privacy" className="button-link">View Privacy Notice</Link>
            <Link href="/support" className="button-link btn-secondary">Open Support</Link>
          </div>
        </div>

        <div className="panel">
          <div className="section-kicker">Business Profile</div>
          <div className="helper">Brand: {settings.brandName}</div>
          <div className="helper">Company: {settings.companyName}</div>
          <div className="helper">Website: {settings.siteUrl}</div>
          <div className="helper">Contact: {settings.contactName}</div>
          <div className="helper">Role: {settings.contactRole}</div>
          <div className="helper">Email: {settings.contactEmail}</div>
          <div className="helper">Business Hours: {settings.businessHours}</div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <div className="card-grid grid-2">
          {termSections.map((section) => (
            <article className="card" key={section.title}>
              <div className="section-kicker">Terms Section</div>
              <h2 style={{ marginTop: 0 }}>{section.title}</h2>
              <ul className="list-clean">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
