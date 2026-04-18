import { SectionTitle } from "@/components/section-title";
import { SupportChatWidget } from "@/components/support-chat-widget";
import { getSupportRouteStatus, supportVerificationScenarios } from "@/lib/openai-support";
import { getPublicSettings } from "@/lib/settings";

export default async function SupportPage() {
  const [settings, status] = await Promise.all([
    getPublicSettings(),
    Promise.resolve(getSupportRouteStatus()),
  ]);

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
                {supportVerificationScenarios.map((category) => (
                  <li key={category.key}>
                    <strong>{category.label}:</strong> {category.description}
                  </li>
                ))}
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
              <div className="card-title">Production readiness</div>
              <ul className="feature-list">
                <li>{status.chatkitReady ? "ChatKit workflow configured" : "ChatKit workflow still needs publishing"}</li>
                <li>{status.webhookReady ? "Webhook signing secret configured" : "Webhook signing secret still missing"}</li>
                <li>{status.hasWorkflowVersion ? "Workflow version pinned in env" : "Workflow version will use latest deployed build"}</li>
                <li>Team routing contact: {settings.contactEmail}</li>
              </ul>
            </div>

            <div className="card">
              <div className="card-title">Required routes for production</div>
              <ul className="feature-list">
                <li>`/support` for the public support desk</li>
                <li>`/api/chatkit/session` for workflow readiness and ChatKit session creation</li>
                <li>`/api/openai/webhook` for signed OpenAI webhook delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
