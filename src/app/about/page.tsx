import Link from 'next/link';
import { getContentMap } from '@/lib/site';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const values = [
  { title: 'Integrity', text: 'Transparent operations, fair partnerships, and disciplined execution across every event and engagement.' },
  { title: 'Excellence', text: 'High standards in sports management, creative output, and commercial delivery.' },
  { title: 'Innovation', text: 'Practical use of technology, media, and modern workflows to improve sports experiences.' },
  { title: 'Community', text: 'Strong grassroots connection with athletes, teams, schools, barangays, and fans.' },
];

export default async function AboutPage() {
  const [contentMap, settings] = await Promise.all([getContentMap(), getPublicSettings()]);
  const story = contentMap['about.story'];

  return (
    <main className="section">
      <div className="container split">
        <div>
          <div className="section-kicker">{story.subtitle}</div>
          <h1 className="section-title">{story.title}</h1>
          <p className="section-copy">{story.body}</p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href={story.ctaHref || '/contact'} className="button-link">{story.ctaLabel || `Contact ${settings.contactName}`}</Link>
          </div>
        </div>
        <div className="panel">
          <div className="section-kicker">Mission</div>
          <p className="section-copy">To empower the sports industry with professional management, athlete development, media-driven visibility, and partnership solutions that create lasting value for every stakeholder.</p>
          <div className="section-kicker" style={{ marginTop: 20 }}>Vision</div>
          <p className="section-copy">To become a leading sports platform recognized for operational excellence, credible audience reach, and meaningful community impact.</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <div className="section-kicker">Core Values</div>
        <div className="card-grid grid-4">
          {values.map((value) => (
            <article className="card" key={value.title}>
              <h3>{value.title}</h3>
              <p className="section-copy" style={{ fontSize: '1rem' }}>{value.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <div className="panel">
          <div className="section-kicker">Contact {settings.contactName}</div>
          <h2 style={{ marginTop: 0 }}>Ready to discuss sponsorships, uniforms, league activations, or custom partnerships?</h2>
          <p className="section-copy">
            {settings.brandName} is operated by {settings.companyName} and is open for brand collaborations,
            tournament support, media partnerships, and sports program development.
          </p>
          <div className="helper">Primary Contact: {settings.contactName}</div>
          <div className="helper">Role: {settings.contactRole}</div>
          <div className="helper">Email: {settings.contactEmail}</div>
          <div className="helper">Phone: {settings.contactPhone}</div>
          <div className="helper">Support Desk: {settings.supportEmail} / {settings.supportPhone}</div>
          <div className="helper">Business Hours: {settings.businessHours}</div>
          <div className="helper">Website: {settings.siteUrl}</div>
          <div className="helper">Location: {settings.location}</div>
          <div className="btn-row" style={{ marginTop: 18 }}>
            <Link href="/contact" className="button-link">Go to Contact Page</Link>
            <a href={`mailto:${settings.contactEmail}`} className="button-link btn-secondary">Email Partnerships</a>
          </div>
        </div>
      </div>
    </main>
  );
}
