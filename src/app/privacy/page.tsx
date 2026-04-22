import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Policy | RESURGENCE',
  description: 'Privacy notice for RESURGENCE Powered by DesignXpress account registration, support, and platform operations.',
};

const updatedLabel = 'April 22, 2026';

const privacySections = [
  {
    title: 'Information You Provide',
    points: [
      'We may collect the information you submit through registration, login, inquiry, checkout, support, creator, sponsor, and partner workflows.',
      'This can include your name, email address, mobile number, selected role, referral code, account profile details, and the contents of messages or form submissions you send to the platform.',
      'If you use commerce or quotation features, the information you provide for order handling, billing coordination, delivery, or business follow-up may also be stored in the platform.',
    ],
  },
  {
    title: 'Google And Mobile Verification',
    points: [
      'If you continue with Google sign-in, the platform may receive identity details associated with the verified Google account, such as your email address, display name, and profile image.',
      'If you register through mobile verification, the platform may process your phone number, one-time-password verification details, and the account data required to activate your selected role.',
    ],
  },
  {
    title: 'How Information Is Used',
    points: [
      'We use submitted information to create and secure accounts, verify sign-in activity, provide role-based access, and support platform operations.',
      'Information may also be used to respond to inquiries, process sponsorship or partnership requests, handle orders and support tickets, and maintain records related to community, commerce, and admin workflows.',
      'Operational data may be reviewed for reliability, fraud prevention, troubleshooting, reporting, and service improvement.',
    ],
  },
  {
    title: 'Operational Access And Service Providers',
    points: [
      'Information may be accessible to authorized team members of RESURGENCE Powered by DesignXpress and DesignXpress Merchandising OPC when needed for support, administration, order handling, moderation, or business follow-up.',
      'Platform data may also be processed by infrastructure, hosting, storage, messaging, analytics, or authentication providers used to run the service.',
      'We may disclose information when required for legal compliance, security response, or the protection of the platform, its users, and business operations.',
    ],
  },
  {
    title: 'Your Choices',
    points: [
      'You may contact the team if you need help correcting account information, following up on an inquiry, or understanding how a submitted request is being handled.',
      'Commercial approvals, sponsorship commitments, quotations, inventory availability, and delivery timelines remain subject to human confirmation where required.',
    ],
  },
  {
    title: 'Contact',
    points: [
      'Privacy or account questions can be sent through the official contact and support channels listed on this site.',
    ],
  },
];

export default async function PrivacyPage() {
  const settings = await getPublicSettings();

  return (
    <main className="section">
      <div className="container split">
        <div>
          <div className="section-kicker">Privacy Notice</div>
          <h1 className="section-title">How {settings.brandName} handles account and platform information.</h1>
          <p className="section-copy">
            This page explains the basic privacy handling for registration, sign-in, inquiries, support, and platform participation across
            {' '}{settings.brandName}.
          </p>
          <div className="helper">Last updated: {updatedLabel}</div>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/terms" className="button-link">View Terms</Link>
            <Link href="/contact" className="button-link btn-secondary">Contact the Team</Link>
          </div>
        </div>

        <div className="panel">
          <div className="section-kicker">Official Contact</div>
          <div className="helper">Brand: {settings.brandName}</div>
          <div className="helper">Company: {settings.companyName}</div>
          <div className="helper">Website: {settings.siteUrl}</div>
          <div className="helper">Primary Contact: {settings.contactName}</div>
          <div className="helper">Role: {settings.contactRole}</div>
          <div className="helper">Email: {settings.contactEmail}</div>
          <div className="helper">Support: {settings.supportEmail}</div>
          <div className="helper">Phone: {settings.supportPhone || settings.contactPhone}</div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <div className="card-grid grid-2">
          {privacySections.map((section) => (
            <article className="card" key={section.title}>
              <div className="section-kicker">Policy Section</div>
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
