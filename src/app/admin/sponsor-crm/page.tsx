import Link from 'next/link';

import { AdminShell } from '@/components/admin-shell';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const pipelineStatuses = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_REVISION',
  'APPROVED',
  'REJECTED',
  'CONVERTED_TO_ACTIVE_SPONSOR',
] as const;

function extractManualReference(notes?: string | null) {
  if (!notes) return '—';
  const match = notes.match(/GCash Ref:\s*([^\n]+)/i);
  return match?.[1]?.trim() || '—';
}

export default async function AdminSponsorCrmPage() {
  const [submissions, packageTemplates] = await Promise.all([
    prisma.sponsorSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.sponsorPackageTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  const stats = [
    { label: 'Total Leads', value: submissions.length },
    { label: 'New Applications', value: submissions.filter((item) => item.status === 'SUBMITTED').length },
    { label: 'Under Review', value: submissions.filter((item) => item.status === 'UNDER_REVIEW').length },
    { label: 'Approved', value: submissions.filter((item) => item.status === 'APPROVED').length },
    { label: 'Converted', value: submissions.filter((item) => item.status === 'CONVERTED_TO_ACTIVE_SPONSOR').length },
    { label: 'GCash Refs', value: submissions.filter((item) => item.internalNotes?.includes('GCash Ref:')).length },
  ];

  return (
    <main>
      <AdminShell
        title="Sponsor CRM"
        description="Review DAYO Series sponsor leads, monitor package interest, verify GCash references, and move sponsors through the pipeline."
        currentPath="/admin/sponsor-crm"
      >
        <section className="card-grid grid-3">
          {stats.map((stat) => (
            <article className="card" key={stat.label}>
              <div className="section-kicker">{stat.label}</div>
              <h2 style={{ margin: '8px 0 0' }}>{stat.value}</h2>
            </article>
          ))}
        </section>

        <section className="card" style={{ marginTop: 24 }}>
          <div className="section-kicker">Active Sponsor Packages</div>
          <div className="card-grid grid-3" style={{ marginTop: 16 }}>
            {packageTemplates.map((pkg) => (
              <div className="panel" key={pkg.id}>
                <strong>{pkg.name}</strong>
                <p className="helper">{pkg.tier} · {pkg.rangeLabel}</p>
                <p className="section-copy">{pkg.summary}</p>
              </div>
            ))}
            {packageTemplates.length === 0 ? <p className="helper">No active package templates yet.</p> : null}
          </div>
        </section>

        <section className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="section-kicker">Sponsor Pipeline</div>
              <h2 style={{ marginTop: 6 }}>Latest Applications</h2>
            </div>
            <Link className="button" href="/dayo-series-ofw-all-star" target="_blank">
              Open DAYO Landing
            </Link>
          </div>

          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead>
                <tr>
                  {['Company', 'Contact', 'Package', 'Status', 'GCash Ref', 'Submitted', 'Actions'].map((heading) => (
                    <th key={heading} style={{ textAlign: 'left', padding: '12px 10px', borderBottom: '1px solid rgba(148,163,184,0.25)' }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                      <strong>{item.companyName}</strong>
                      <div className="helper">{item.category}</div>
                    </td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                      <strong>{item.contactName}</strong>
                      <div className="helper">{item.email}</div>
                      {item.phone ? <div className="helper">{item.phone}</div> : null}
                    </td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                      {item.interestedPackage}
                      <div className="helper">{item.budgetRange}</div>
                    </td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                      <span className="status-pill">{item.status.replaceAll('_', ' ')}</span>
                    </td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                      {extractManualReference(item.internalNotes)}
                    </td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                      {item.createdAt.toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {pipelineStatuses.map((status) => (
                          <Link
                            key={status}
                            href={`/api/admin/sponsor-crm/${item.id}/status?status=${status}`}
                            className="button secondary"
                            style={{ fontSize: 12, padding: '6px 8px' }}
                          >
                            {status.replaceAll('_', ' ')}
                          </Link>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 20 }}>
                      No sponsor leads yet. Share the DAYO landing page to start capturing applications.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </AdminShell>
    </main>
  );
}
