import { InquiryForm } from '@/components/forms/inquiry-form';
import { SupportChatWidget } from '@/components/support-chat-widget';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

function getHostLabel(siteUrl: string) {
  try {
    return new URL(siteUrl).host;
  } catch {
    return siteUrl;
  }
}

export default async function SupportPage() {
  const settings = await getPublicSettings();
  const siteHost = getHostLabel(settings.siteUrl);

  return (
    <main className="section">
      <div className="container">
        <div className="section-kicker">{siteHost}</div>
        <h1 className="section-title">AI customer service for {settings.brandName}.</h1>
        <p className="section-copy" style={{ maxWidth: 880 }}>
          This page combines an AI support assistant with your inquiry workflow so prospects can ask questions instantly
          and still be routed to your team for proposals, sponsorship discussions, and follow-up.
        </p>
      </div>

      <div className="container split" style={{ marginTop: 32, alignItems: 'stretch' }}>
        <div>
          <SupportChatWidget />
        </div>

        <div className="card">
          <div className="section-kicker">Human Follow-up</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Need a proposal, quotation, or direct callback?</h2>
          <p className="helper" style={{ marginTop: 0 }}>
            Leave your details below and the {settings.companyName} team can continue the conversation from the admin dashboard.
          </p>

          <div className="panel" style={{ marginTop: 20, marginBottom: 20 }}>
            <div className="helper">Primary Contact: {settings.contactName}</div>
            <div className="helper">Role: {settings.contactRole}</div>
            <div className="helper">Email: {settings.contactEmail}</div>
            <div className="helper">Phone: {settings.contactPhone}</div>
            <div className="helper">Support: {settings.supportEmail} / {settings.supportPhone}</div>
            <div className="helper">Business Hours: {settings.businessHours}</div>
            <div className="helper">Location: {settings.location}</div>
          </div>

          <InquiryForm />
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <div className="panel">
          <div className="section-kicker">Business Profile</div>
          <div className="helper">Brand: {settings.brandName}</div>
          <div className="helper">Company: {settings.companyName}</div>
          <div className="helper">Website: {settings.siteUrl}</div>
          <div className="helper">Currency: {settings.currency}</div>
          <div className="helper">Payment Methods: {settings.paymentMethods}</div>
          <div className="helper">Shipping Area: {settings.shippingArea}</div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <div className="panel">
          <div className="section-kicker">Recommended Workflow Prompt</div>
          <h3 style={{ marginTop: 0 }}>Use this inside OpenAI Agent Builder</h3>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              margin: 0,
              color: 'var(--muted)',
              lineHeight: 1.7,
              fontFamily: 'inherit',
            }}
          >
{`You are the official customer service assistant for ${settings.brandName}, operated by ${settings.companyName}.

Your responsibilities:
- Answer questions about sponsorship packages, partnerships, basketball events, custom apparel, payments, and shipping coverage.
- Stay concise, professional, and helpful.
- Never invent package terms, prices, or commitments that are not confirmed.
- For sponsorship and partnership requests, route high-intent leads to ${settings.contactName} (${settings.contactRole}) via ${settings.contactEmail} or ${settings.contactPhone}.
- For general support, use ${settings.supportEmail} and ${settings.supportPhone}, with business hours ${settings.businessHours}.
- Keep the tone premium, sports-focused, and brand-safe.
- If unsure, clearly say a human team member will confirm the details.`}
          </pre>
        </div>
      </div>
    </main>
  );
}
