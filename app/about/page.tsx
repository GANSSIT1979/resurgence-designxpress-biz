import { SectionTitle } from "@/components/section-title";
import { KPIGrid } from "@/components/kpi-grid";

export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="container">
        <SectionTitle
          eyebrow="About"
          title="A modern sponsorship and creator operations platform"
          subtitle="RESURGENCE Powered by DesignXpress blends sports branding, commercial partnerships, and operational systems into one deployable platform."
        />
        <KPIGrid
          items={[
            { label: "Combined Reach", value: "2.15M+" },
            { label: "Creators", value: "6" },
            { label: "Platform Focus", value: "Sports + Business" },
            { label: "Deployment", value: "Local + Cloud" }
          ]}
        />
        <div className="grid-2 section">
          <div className="card">
            <div className="card-title">Mission</div>
            <p className="muted">Deliver measurable sponsor value through premium media, creator storytelling, and operational execution.</p>
          </div>
          <div className="card">
            <div className="card-title">Positioning</div>
            <p className="muted">Built for executive sponsors, active brand partners, community basketball ecosystems, and media-first commercial growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
