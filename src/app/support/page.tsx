import { InquiryForm } from '@/components/forms/inquiry-form';
import { SupportChatWidget } from '@/components/support-chat-widget';
import { getContentMap } from '@/lib/site';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const [contentMap, settings] = await Promise.all([getContentMap(), getPublicSettings()]);
  const contact = contentMap['contact.details'];

  return (
    <main className="section">
      <div className="container">
        <div className="section-kicker">resurgence.designxpress.biz</div>
        <h1 className="section-title">AI customer service for RESURGENCE Powered by DesignXpress.</h1>
        <p className="section-copy" style={{ maxWidth: 880 }}>
          This page combines an AI support assistant with your existing inquiry workflow so prospects can ask questions instantly and still be routed to your team for proposals and follow-up.
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
            Leave your details below and your staff can continue the conversation from the admin dashboard.
          </p>

          <div className="panel" style={{ marginTop: 20, marginBottom: 20 }}>
            <div className="helper">Contact: {settings.contactName}</div>
            <div className="helper">Email: {settings.contactEmail}</div>
            <div className="helper">Phone: {settings.contactPhone}</div>
            <div className="helper">Address: {settings.contactAddress}</div>
          </div>

          <InquiryForm />
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
{`You are the official customer service assistant for RESURGENCE Powered by DesignXpress.

Your responsibilities:
- Answer questions about sponsorship packages, brand activations, leagues, events, creators, custom uniforms, and general support.
- Stay concise, professional, and helpful.
- Never invent package terms, prices, or commitments that are not confirmed.
- When an inquiry becomes commercial or needs human approval, ask for the visitor's full name, organization, email, phone number, and what they need help with.
- Encourage serious leads to submit the inquiry form on the page for formal follow-up.
- If unsure, clearly say a human team member will confirm the details.
- Keep the tone premium, sports-focused, and brand-safe.`}
          </pre>
        </div>
      </div>
    </main>
  );
}
