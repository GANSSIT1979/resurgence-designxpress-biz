import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type ProposalPageProps = {
  params: Promise<{ id: string }>;
};

function splitBenefits(benefits?: string | null) {
  return (benefits || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildProposalCopy(input: {
  companyName: string;
  contactName: string;
  packageName: string;
  packageSummary: string;
  message?: string | null;
}) {
  const audience = input.message?.trim()
    ? `Based on your stated goals, this proposal positions ${input.companyName} as a visible partner in a community-centered OFW sports activation.`
    : `This proposal positions ${input.companyName} as a visible partner in a community-centered OFW sports activation.`;

  return {
    executiveSummary:
      `${input.companyName} can use the DAYO Series OFW All-Star 2026 platform to build trust, awareness, and community goodwill across Filipino basketball communities in Hong Kong and Macau. ${audience}`,
    strategicFit:
      `${input.packageName} is recommended because it combines event-day presence, digital visibility, and post-event content assets. ${input.packageSummary}`,
    closing:
      `The next step is to finalize package scope, confirm payment, collect brand assets, and schedule sponsor deliverables for ${input.companyName}.`,
  };
}

export default async function SponsorProposalPage({ params }: ProposalPageProps) {
  const { id } = await params;

  const submission = await prisma.sponsorSubmission.findUnique({ where: { id } });
  if (!submission) notFound();

  const packageTemplate = await prisma.sponsorPackageTemplate.findFirst({
    where: {
      OR: [
        { name: submission.interestedPackage },
        { tier: submission.interestedPackage },
      ],
    },
  });

  const packageName = packageTemplate?.name || submission.interestedPackage || 'Custom Sponsorship Package';
  const packageSummary =
    packageTemplate?.summary ||
    'Custom sponsorship exposure across event branding, digital content, community visibility, and sponsor recognition.';
  const benefits = splitBenefits(packageTemplate?.benefits).length
    ? splitBenefits(packageTemplate?.benefits)
    : [
        'Sponsor recognition across DAYO Series promotional materials',
        'Brand visibility during community-facing event moments',
        'Inclusion in recap content and sponsor acknowledgment posts',
        'Opportunity to connect with OFW basketball audiences in Hong Kong and Macau',
      ];

  const proposal = buildProposalCopy({
    companyName: submission.companyName,
    contactName: submission.contactName,
    packageName,
    packageSummary,
    message: submission.message,
  });

  return (
    <main style={{ background: '#0B0E14', color: '#F8FAFC', minHeight: '100vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <Link href="/admin/sponsor-crm" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 800 }}>
            ← Back to Sponsor CRM
          </Link>
          <button onClick={undefined as never} style={{ display: 'none' }} aria-hidden="true" />
          <a href="javascript:window.print()" style={{ color: '#0B0E14', background: '#D4AF37', padding: '10px 16px', borderRadius: 999, fontWeight: 900, textDecoration: 'none' }}>
            Print / Save PDF
          </a>
        </div>

        <section style={{ background: 'linear-gradient(135deg, #111827, #1A1F2B)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: 24, padding: 32 }}>
          <p style={{ color: '#E63946', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 900 }}>
            AI Sponsor Proposal
          </p>
          <h1 style={{ color: '#D4AF37', fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 0.95, margin: '12px 0' }}>
            {submission.companyName}
          </h1>
          <p style={{ fontSize: 22, maxWidth: 760 }}>
            DAYO Series OFW All-Star 2026 Sponsorship Proposal
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginTop: 24 }}>
            <Info label="Contact" value={submission.contactName} />
            <Info label="Email" value={submission.email} />
            <Info label="Package" value={packageName} />
            <Info label="Status" value={submission.status.replaceAll('_', ' ')} />
          </div>
        </section>

        <Section title="Executive Summary">
          <p>{proposal.executiveSummary}</p>
        </Section>

        <Section title="Strategic Fit">
          <p>{proposal.strategicFit}</p>
        </Section>

        <Section title="Recommended Deliverables">
          <ul style={{ lineHeight: 1.9 }}>
            {benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </Section>

        <Section title="Sponsor Objectives">
          <ul style={{ lineHeight: 1.9 }}>
            <li>Increase brand visibility within OFW basketball and family communities.</li>
            <li>Associate the sponsor with sportsmanship, community support, and Filipino pride.</li>
            <li>Create reusable content assets for post-event social proof and marketing.</li>
            <li>Build a measurable sponsor relationship that can extend into future RESURGENCE activations.</li>
          </ul>
        </Section>

        <Section title="Activation Plan">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <PlanStep title="1. Confirm" body="Finalize package scope, deliverables, and payment method." />
            <PlanStep title="2. Collect Assets" body="Gather logo files, brand links, preferred copy, and activation requirements." />
            <PlanStep title="3. Launch Promotion" body="Include sponsor in event materials, social posts, and public-facing sponsor assets." />
            <PlanStep title="4. Report" body="Provide post-event proof of exposure, recap content, and next-step recommendations." />
          </div>
        </Section>

        <Section title="Closing Recommendation">
          <p>{proposal.closing}</p>
          <p style={{ color: '#D4AF37', fontWeight: 900 }}>
            Recommended action: approve proposal, confirm payment, and begin sponsor onboarding.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#0F172A', borderRadius: 14, padding: 14 }}>
      <div style={{ color: '#D4AF37', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#111827', border: '1px solid rgba(148,163,184,0.22)', borderRadius: 20, padding: 24, marginTop: 20 }}>
      <h2 style={{ color: '#D4AF37', marginTop: 0 }}>{title}</h2>
      <div style={{ lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}

function PlanStep({ title, body }: { title: string; body: string }) {
  return (
    <article style={{ background: '#0F172A', borderRadius: 16, padding: 18 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
