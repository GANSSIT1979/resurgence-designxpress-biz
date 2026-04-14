import { PublicContactForm } from "@/components/public-contact-form";
import { SectionTitle } from "@/components/section-title";

export default function ContactPage() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="grid-2">
          <div>
            <SectionTitle
              eyebrow="Contact"
              title="Reach the RESURGENCE business team"
              subtitle="Use this inquiry channel for sponsor packages, partnerships, creator campaigns, and operational support."
            />
            <div className="card">
              <div className="card-title">Contact Jake</div>
              <p className="muted">Business and sponsorship coordination for RESURGENCE Powered by DesignXpress.</p>
              <ul className="feature-list">
                <li>Email-backed inquiry workflow</li>
                <li>Admin review queue</li>
                <li>Support-ready escalation path</li>
              </ul>
            </div>
          </div>
          <PublicContactForm />
        </div>
      </div>
    </div>
  );
}
