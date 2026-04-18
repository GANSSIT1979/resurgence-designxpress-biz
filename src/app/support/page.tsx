import { InquiryForm } from '@/components/forms/inquiry-form';
import { SupportChatWidget } from '@/components/support-chat-widget';
import { getSupportRouteStatus, supportCategories } from '@/lib/openai-support';
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
  const supportStatus = getSupportRouteStatus();
  const siteHost = getHostLabel(settings.siteUrl);
  const supportMode = supportStatus.chatkitReady
    ? 'AI-assisted support is available.'
    : 'Fallback routing is active while AI setup is completed.';

  return (
    <main>
      <section className="support-page-hero">
        <div className="container support-page-hero-grid">
          <div>
            <div className="section-kicker">{siteHost}</div>
            <h1 className="hero-title">Live Support Desk for RESURGENCE Customer Service.</h1>
            <p className="hero-copy">
              A comprehensive customer service hub for sponsorships, shop orders, payments, basketball events,
              custom apparel, partnerships, and human follow-up from {settings.companyName}.
            </p>
            <div className="btn-row" style={{ marginTop: 22 }}>
              <a className="button-link" href={`mailto:${settings.supportEmail}`}>Email Support</a>
              <a className="button-link btn-secondary" href={`tel:${settings.supportPhone.replace(/[^\d+]/g, '')}`}>Call Support</a>
              <a className="button-link btn-secondary" href="/contact">Contact Page</a>
            </div>
          </div>

          <div className="support-hero-card">
            <div className="section-kicker">Support Accuracy</div>
            <h2>{supportMode}</h2>
            <p className="helper">
              The desk uses official business settings for contact details, payment methods, business hours, and shipping coverage.
              If a request needs confirmation, it routes the visitor to human follow-up instead of inventing commitments.
            </p>
            <div className="support-health-list">
              <div><span>AI workflow</span><strong>{supportStatus.chatkitReady ? 'Configured' : 'Fallback mode'}</strong></div>
              <div><span>Webhook verification</span><strong>{supportStatus.webhookReady ? 'Ready' : 'Pending'}</strong></div>
              <div><span>Lead capture</span><strong>Active</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section support-desk-section">
        <div className="container support-desk-layout">
          <SupportChatWidget settings={settings} />

          <aside className="support-side-panel">
            <section className="card">
              <div className="section-kicker">Official Customer Service</div>
              <h2 style={{ marginTop: 0 }}>How to reach the team</h2>
              <div className="support-contact-card-list">
                <div>
                  <span>Primary Contact</span>
                  <strong>{settings.contactName}</strong>
                  <p>{settings.contactRole}</p>
                </div>
                <div>
                  <span>Partnerships</span>
                  <strong>{settings.contactEmail}</strong>
                  <p>{settings.contactPhone}</p>
                </div>
                <div>
                  <span>Support Desk</span>
                  <strong>{settings.supportEmail}</strong>
                  <p>{settings.supportPhone}</p>
                </div>
                <div>
                  <span>Business Hours</span>
                  <strong>{settings.businessHours}</strong>
                  <p>{settings.location}</p>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="section-kicker">Business Profile</div>
              <div className="support-fact-list">
                <div><span>Brand</span><strong>{settings.brandName}</strong></div>
                <div><span>Company</span><strong>{settings.companyName}</strong></div>
                <div><span>Currency</span><strong>{settings.currency}</strong></div>
                <div><span>Payment Methods</span><strong>{settings.paymentMethods}</strong></div>
                <div><span>Shipping Area</span><strong>{settings.shippingArea}</strong></div>
              </div>
            </section>
          </aside>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-kicker">Support Routing</div>
          <h2 className="section-title">Comprehensive help topics with accurate handoff rules.</h2>
          <div className="card-grid grid-3" style={{ marginTop: 24 }}>
            {supportCategories.map((category) => (
              <article className="card support-topic-card" key={category.key}>
                <div className="section-kicker">{category.label}</div>
                <h3>{category.routeLabel}</h3>
                <p className="helper">{category.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container card-grid grid-2">
          <section className="card">
            <div className="section-kicker">Formal Inquiry</div>
            <h2 style={{ marginTop: 0 }}>Need a proposal, quotation, order follow-up, or callback?</h2>
            <p className="helper">
              Submit the form below when your request needs admin review, pricing confirmation, or a scheduled human response.
            </p>
            <div style={{ marginTop: 20 }}>
              <InquiryForm />
            </div>
          </section>

          <section className="card">
            <div className="section-kicker">Customer Service Rules</div>
            <h2 style={{ marginTop: 0 }}>Accurate answers, safe routing, clear next steps.</h2>
            <ul className="list-clean support-rule-list">
              <li>Uses official support contacts, payment methods, currency, business hours, and shipping coverage from platform settings.</li>
              <li>Does not invent pricing, stock, sponsorship commitments, delivery promises, or contract terms.</li>
              <li>Routes commercial, order, payment, and production requests into admin/staff follow-up through inquiry records and notifications.</li>
              <li>For payment support, visitors are reminded not to share sensitive card numbers or financial credentials.</li>
              <li>If AI credentials are not configured, local fallback responses and lead capture still work.</li>
            </ul>
          </section>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="panel support-prompt-panel">
            <div className="section-kicker">Recommended Workflow Prompt</div>
            <h3 style={{ marginTop: 0 }}>Use this inside OpenAI Agent Builder</h3>
            <pre>
{`You are the official customer service assistant for ${settings.brandName}, operated by ${settings.companyName}.

Your responsibilities:
- Answer questions about sponsorship packages, partnerships, basketball events, shop orders, custom apparel, payments, and shipping coverage.
- Use only confirmed business information:
  Website: ${settings.siteUrl}
  Currency: ${settings.currency}
  Payment methods: ${settings.paymentMethods}
  Shipping area: ${settings.shippingArea}
  Business hours: ${settings.businessHours}
- For sponsorship and partnership requests, route high-intent leads to ${settings.contactName} (${settings.contactRole}) via ${settings.contactEmail} or ${settings.contactPhone}.
- For order, payment, and general support, use ${settings.supportEmail} and ${settings.supportPhone}.
- Never invent prices, inventory, delivery promises, sponsorship terms, or approvals.
- Never ask visitors to provide sensitive card numbers or private financial credentials.
- When a request needs approval or confirmation, ask for full name, organization, email, mobile number, and a concise request summary.
- Keep the tone premium, sports-focused, concise, and brand-safe.
- If unsure, clearly say a human team member will confirm the details.`}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
