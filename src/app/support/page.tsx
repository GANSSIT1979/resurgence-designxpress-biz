import { SectionTitle } from "@/components/section-title";
import { SupportChatWidget } from "@/components/support-chat-widget";

export default function SupportPage() {
  return (
    <div className="page-shell">
      <div className="container">
        <SectionTitle
          eyebrow="Support"
          title="AI-powered RESURGENCE customer service"
          subtitle="A persistent support desk with conversation memory, business lead capture, and team routing readiness."
        />

        <div className="grid-2 support-page-grid">
          <SupportChatWidget />

          <div className="list-stack">
            <div className="card">
              <div className="card-title">What the support desk handles</div>
              <ul className="feature-list">
                <li>Sponsorship package questions</li>
                <li>Partnership and basketball event collaboration inquiries</li>
                <li>Custom jerseys, uniforms, and merchandise support</li>
                <li>General follow-up and business coordination</li>
              </ul>
            </div>

            <div className="card">
              <div className="card-title">Lead capture behavior</div>
              <ul className="feature-list">
                <li>The assistant answers first before asking for business details.</li>
                <li>Once details are saved, the app stores leadCaptured in Prisma.</li>
                <li>The assistant stops repeating the same lead-capture request.</li>
                <li>New captured leads create inquiry, email queue, and admin notification records.</li>
              </ul>
            </div>

            <div className="card">
              <div className="card-title">Environment readiness</div>
              <ul className="feature-list">
                <li>OPENAI_API_KEY</li>
                <li>OPENAI_WORKFLOW_ID</li>
                <li>OPENAI_WEBHOOK_SECRET</li>
                <li>NEXT_PUBLIC_SITE_URL</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
