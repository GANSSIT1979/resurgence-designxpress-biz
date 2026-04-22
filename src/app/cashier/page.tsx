import { NotificationCenter } from '@/components/notification-center';
import { RoleShell } from '@/components/role-shell';
import { getAutomationInbox } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import { cashierNavItems, formatCurrency, formatDate } from '@/lib/cashier';
import { getCurrentSessionUser } from '@/lib/session-server';

export const dynamic = 'force-dynamic';

export default async function CashierDashboardPage() {
  const sessionContext = await getCurrentSessionUser();
  const [invoices, transactions, receipts] = await Promise.all([
    prisma.invoice.findMany({ orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }], take: 5 }),
    prisma.cashierTransaction.findMany({ orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }], take: 5 }),
    prisma.receipt.findMany({ orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }], take: 5 }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const todayCollections = transactions
    .filter((item) => item.kind === 'COLLECTION' && item.transactionDate.toISOString().slice(0, 10) === today)
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingReceivables = invoices.reduce((sum, item) => sum + item.balanceAmount, 0);
  const paidInvoices = invoices.filter((item) => item.status === 'PAID').length;
  const overdueInvoices = invoices.filter((item) => item.status === 'OVERDUE').length;
  const inbox = sessionContext ? await getAutomationInbox(sessionContext.user.role, sessionContext.user.id, 6) : { notifications: [], emails: [], degradedReason: null };

  return (
    <main>
      <RoleShell
        roleLabel="Cashier"
        title="Collections and Sponsor Billing Overview"
        description="Manage real invoices, transactions, receipts, and summary finance reporting for RESURGENCE sponsorship operations."
        navItems={cashierNavItems as any}
        currentPath="/cashier"
      >
        <div className="card-grid grid-4">
          <div className="panel"><strong>{formatCurrency(todayCollections)}</strong><div className="helper">Today's collections</div></div>
          <div className="panel"><strong>{formatCurrency(pendingReceivables)}</strong><div className="helper">Outstanding receivables</div></div>
          <div className="panel"><strong>{paidInvoices}</strong><div className="helper">Paid invoices</div></div>
          <div className="panel"><strong>{overdueInvoices}</strong><div className="helper">Overdue invoices</div></div>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Latest Transactions</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Company</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.transactionNumber}</td>
                      <td>{item.companyName}</td>
                      <td>{formatCurrency(item.amount)}</td>
                      <td>{formatDate(item.transactionDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <div className="section-kicker">Open Invoices</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((item) => (
                    <tr key={item.id}>
                      <td>{item.invoiceNumber}<div className="helper">{item.companyName}</div></td>
                      <td>{formatCurrency(item.balanceAmount)}</td>
                      <td>{item.status.replaceAll('_', ' ')}</td>
                      <td>{formatDate(item.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Receipt Activity</div>
            <p className="section-copy">{receipts.length} receipts are currently recorded in the system. Use the Receipts module to issue and maintain official acknowledgement entries for sponsor payments.</p>
          </section>
          <section className="card">
            <div className="section-kicker">Cashier Workflow</div>
            <p className="section-copy">Recommended flow: create invoice → record collection or adjustment → issue receipt → review reports. Linked invoice balances update automatically when transactions are posted.</p>
          </section>
        </div>

        <div style={{ marginTop: 20 }}>
          <NotificationCenter
            title="Finance alerts and automated emails"
            notifications={inbox.notifications}
            emails={inbox.emails}
            degradedMessage={inbox.degradedReason ?? null}
          />
        </div>
      </RoleShell>
    </main>
  );
}
