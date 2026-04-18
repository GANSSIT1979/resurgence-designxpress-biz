import { LoginForm } from '@/components/forms/login-form';

export default function AdminLoginPage() {
  return (
    <main className="section">
      <div className="container split" style={{ alignItems: 'start' }}>
        <div>
          <div className="section-kicker">Dashboard Access</div>
          <h1 className="section-title">Role-based access for System Admin, Cashier, Sponsor, Staff, and Partners.</h1>
          <p className="section-copy">
            This release upgrades RESURGENCE Powered by DesignXpress into a multi-role dashboard experience aligned with the 2026 sponsorship proposal, creator network, package tiers, and CMS workflows.
          </p>

          <div className="card-grid grid-2" style={{ marginTop: 24 }}>
            <article className="card">
              <div className="section-kicker">System Admin</div>
              <p className="helper">Manage sponsor submissions, packages, creator network, inventory, content, reports, and live site data.</p>
            </article>
            <article className="card">
              <div className="section-kicker">Cashier</div>
              <p className="helper">Handle invoices, collections, sponsor billing visibility, receipts, and finance summaries.</p>
            </article>
            <article className="card">
              <div className="section-kicker">Sponsor</div>
              <p className="helper">Track applications, package tier, billing, and sponsor deliverables tied to the 2026 deck.</p>
            </article>
            <article className="card">
              <div className="section-kicker">Staff & Partners</div>
              <p className="helper">Coordinate tasks, inquiries, referrals, campaign activity, and agreement visibility.</p>
            </article>
          </div>
        </div>

        <div className="card">
          <div className="section-kicker">Secure Sign In</div>
          <h2 style={{ marginTop: 0 }}>Access your assigned dashboard</h2>
          <p className="helper">Local demo accounts are seeded during database setup for each role.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
