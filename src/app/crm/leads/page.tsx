import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CrmLeadsPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="section-kicker">CRM</div>
        <h1 className="section-title">Leads Pipeline</h1>
        <p className="section-copy">
          Manage sponsor leads, CRM follow-ups, proposal activity, and event pipeline opportunities.
        </p>

        <div className="btn-row" style={{ marginTop: 20 }}>
          <Link href="/admin/sponsor-crm" className="button-link">
            Open Sponsor CRM
          </Link>
          <Link href="/admin/events" className="button-link btn-secondary">
            Open Event Pipelines
          </Link>
        </div>
      </div>
    </main>
  );
}
