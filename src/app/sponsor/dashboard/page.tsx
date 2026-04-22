import { NotificationCenter } from '@/components/notification-center';
import { getAutomationInbox } from '@/lib/notifications';
import { RoleShell } from '@/components/role-shell';
import { prisma } from '@/lib/prisma';
import { sponsorNavItems, formatCurrency, formatDate } from '@/lib/sponsor';
import { buildSponsorInvoiceWhere, getCurrentSponsorContext } from '@/lib/sponsor-server';

export const dynamic = 'force-dynamic';

export default async function SponsorDashboardPage() {
  const context = await getCurrentSponsorContext();

  if (!context) {
    return (
      <main>
        <RoleShell roleLabel="Sponsor" title="Sponsor Portal Overview" description="Unable to load sponsor session." navItems={sponsorNavItems as any} currentPath="/sponsor/dashboard">
          <section className="card"><p className="section-copy">Please sign in again to continue.</p></section>
        </RoleShell>
      </main>
    );
  }

  const invoiceWhere = buildSponsorInvoiceWhere(context.sponsorProfile);
  const [applications, deliverables, invoices] = await Promise.all([
    prisma.sponsorSubmission.findMany({ where: { sponsorProfileId: context.sponsorProfile.id }, orderBy: [{ createdAt: 'desc' }], take: 5 }),
    prisma.sponsorDeliverable.findMany({ where: { sponsorProfileId: context.sponsorProfile.id }, orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }], take: 6 }),
    prisma.invoice.findMany({ where: invoiceWhere, orderBy: [{ issueDate: 'desc' }], take: 5 }),
  ]);

  const receipts = await prisma.receipt.findMany({
    where: { invoiceId: { in: invoices.map((item) => item.id) } },
    orderBy: [{ issuedAt: 'desc' }],
    take: 5,
  });

  const outstanding = invoices.reduce((sum, item) => sum + item.balanceAmount, 0);
  const totalInvoiced = invoices.reduce((sum, item) => sum + item.amount, 0);
  const completedDeliverables = deliverables.filter((item) => item.status === 'COMPLETED').length;
  const pendingApplications = applications.filter((item) => ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION'].includes(item.status)).length;
  const inbox = await getAutomationInbox(context.user.role, context.user.id, 6);

  return (
    <main>
      <RoleShell
        roleLabel="Sponsor"
        title="Sponsor Portal Overview"
        description="Track package selection, application progress, deliverable completion, and billing readiness aligned with the 2026 sponsorship deck."
        navItems={sponsorNavItems as any}
        currentPath="/sponsor/dashboard"
      >
        <div className="card-grid grid-4">
          <div className="panel"><strong>{context.sponsorProfile.preferredPackage?.name || 'Custom / Not set'}</strong><div className="helper">Preferred package</div></div>
          <div className="panel"><strong>{pendingApplications}</strong><div className="helper">Open applications</div></div>
          <div className="panel"><strong>{completedDeliverables}/{deliverables.length}</strong><div className="helper">Completed deliverables</div></div>
          <div className="panel"><strong>{formatCurrency(outstanding)}</strong><div className="helper">Outstanding balance</div></div>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Sponsor Snapshot</div>
            <h2 style={{ marginTop: 0 }}>{context.sponsorProfile.companyName}</h2>
            <p className="section-copy">{context.sponsorProfile.brandSummary || 'Keep your sponsor profile updated so package recommendations, billing, and deliverables stay aligned.'}</p>
            <div className="helper">Contact: {context.sponsorProfile.contactName} • {context.sponsorProfile.contactEmail}</div>
            <div className="helper">Linked sponsor record: {context.sponsorProfile.sponsor?.name || 'Not linked yet'}</div>
            <div className="helper">Total invoiced: {formatCurrency(totalInvoiced)}</div>
          </section>
          <section className="card">
            <div className="section-kicker">Billing Snapshot</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Status</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((item) => (
                    <tr key={item.id}>
                      <td>{item.invoiceNumber}<div className="helper">{formatDate(item.issueDate)}</div></td>
                      <td>{item.status.replaceAll('_', ' ')}</td>
                      <td>{formatCurrency(item.balanceAmount)}</td>
                    </tr>
                  ))}
                  {!invoices.length ? <tr><td colSpan={3}><span className="helper">No sponsor billing records yet.</span></td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Recent Applications</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Status</th>
                    <th>Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((item) => (
                    <tr key={item.id}>
                      <td>{item.interestedPackage}<div className="helper">{item.category}</div></td>
                      <td>{item.status.replaceAll('_', ' ')}</td>
                      <td>{item.budgetRange}</td>
                    </tr>
                  ))}
                  {!applications.length ? <tr><td colSpan={3}><span className="helper">No applications yet.</span></td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card">
            <div className="section-kicker">Recent Deliverables</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Deliverable</th>
                    <th>Status</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverables.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}<div className="helper">{item.category}</div></td>
                      <td>{item.status.replaceAll('_', ' ')}</td>
                      <td>{formatDate(item.dueDate)}</td>
                    </tr>
                  ))}
                  {!deliverables.length ? <tr><td colSpan={3}><span className="helper">No deliverables assigned yet.</span></td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="card" style={{ marginTop: 20 }}>
          <div className="section-kicker">Receipt Activity</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Amount</th>
                  <th>Issued</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((item) => (
                  <tr key={item.id}>
                    <td>{item.receiptNumber}<div className="helper">{item.receivedFrom}</div></td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{formatDate(item.issuedAt)}</td>
                  </tr>
                ))}
                {!receipts.length ? <tr><td colSpan={3}><span className="helper">No receipts yet.</span></td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ marginTop: 20 }}>
          <NotificationCenter
            title="Sponsor alerts and automated messages"
            notifications={inbox.notifications}
            emails={inbox.emails}
            degradedMessage={inbox.degradedReason ?? null}
          />
        </div>
      </RoleShell>
    </main>
  );
}
