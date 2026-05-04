import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CrmModulePage() {
  return (
    <main className="section">
      <div className="container">
        <div className="section-kicker">CRM Module</div>
        <h1 className="section-title">RESURGENCE CRM</h1>
        <p className="section-copy">Manage leads, sponsors, event pipelines, proposals, and follow-up workflows from the CRM module.</p>
        <div className="btn-row" style={{ marginTop: 20 }}>
          <Link href="/admin/sponsor-crm" className="button-link">Sponsor CRM</Link>
          <Link href="/admin/events" className="button-link btn-secondary">Event Pipelines</Link>
        </div>
      </div>
    </main>
  );
}
