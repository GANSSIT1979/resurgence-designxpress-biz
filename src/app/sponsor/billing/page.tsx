import { RoleShell } from '@/components/role-shell';
import { prisma } from '@/lib/prisma';
import { sponsorNavItems, formatCurrency, formatDate } from '@/lib/sponsor';
import { buildSponsorInvoiceWhere, getCurrentSponsorContext } from '@/lib/sponsor-server';

export const dynamic = 'force-dynamic';

export default async function SponsorBillingPage() {
  const context = await getCurrentSponsorContext();
  if (!context) {
    return (
      <main>
        <RoleShell roleLabel="Sponsor" title="Billing and Receipts" description="Monitor billing status, invoices, transactions, and sponsor payment records." navItems={sponsorNavItems as any} currentPath="/sponsor/billing">
          <section className="card"><p className="section-copy">Unable to load sponsor session.</p></section>
        </RoleShell>
      </main>
    );
  }

  const invoiceWhere = buildSponsorInvoiceWhere(context.sponsorProfile);
  const invoices = await prisma.invoice.findMany({ where: invoiceWhere, orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }] });
  const invoiceIds = invoices.map((item) => item.id);
  const [transactions, receipts] = await Promise.all([
    prisma.cashierTransaction.findMany({ where: { invoiceId: { in: invoiceIds } }, orderBy: [{ transactionDate: 'desc' }] }),
    prisma.receipt.findMany({ where: { invoiceId: { in: invoiceIds } }, orderBy: [{ issuedAt: 'desc' }] }),
  ]);

  const totals = {
    invoiced: invoices.reduce((sum, item) => sum + item.amount, 0),
    outstanding: invoices.reduce((sum, item) => sum + item.balanceAmount, 0),
    paid: invoices.reduce((sum, item) => sum + Math.max(item.amount - item.balanceAmount, 0), 0),
    receipts: receipts.reduce((sum, item) => sum + item.amount, 0),
  };

  return (
    <main>
      <RoleShell roleLabel="Sponsor" title="Billing and Receipts" description="Monitor sponsor-linked invoices, payment activity, and receipt history from the cashier module." navItems={sponsorNavItems as any} currentPath="/sponsor/billing">
        <div className="card-grid grid-4">
          <div className="panel"><strong>{formatCurrency(totals.invoiced)}</strong><div className="helper">Total invoiced</div></div>
          <div className="panel"><strong>{formatCurrency(totals.paid)}</strong><div className="helper">Total paid</div></div>
          <div className="panel"><strong>{formatCurrency(totals.outstanding)}</strong><div className="helper">Outstanding</div></div>
          <div className="panel"><strong>{formatCurrency(totals.receipts)}</strong><div className="helper">Receipted payments</div></div>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="section-kicker">Invoices</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Total</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((item) => (
                    <tr key={item.id}>
                      <td>{item.invoiceNumber}<div className="helper">{formatDate(item.issueDate)}</div></td>
                      <td>{formatCurrency(item.amount)}</td>
                      <td>{formatCurrency(item.balanceAmount)}</td>
                      <td>{item.status.replaceAll('_', ' ')}</td>
                    </tr>
                  ))}
                  {!invoices.length ? <tr><td colSpan={4}><span className="helper">No invoices linked yet.</span></td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card">
            <div className="section-kicker">Transactions</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.transactionNumber}<div className="helper">{item.paymentMethod.replaceAll('_', ' ')}</div></td>
                      <td>{item.kind.replaceAll('_', ' ')}</td>
                      <td>{formatCurrency(item.amount)}</td>
                      <td>{formatDate(item.transactionDate)}</td>
                    </tr>
                  ))}
                  {!transactions.length ? <tr><td colSpan={4}><span className="helper">No transactions recorded yet.</span></td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="card" style={{ marginTop: 20 }}>
          <div className="section-kicker">Receipts</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Received From</th>
                  <th>Amount</th>
                  <th>Issued</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((item) => (
                  <tr key={item.id}>
                    <td>{item.receiptNumber}<div className="helper">{item.paymentMethod.replaceAll('_', ' ')}</div></td>
                    <td>{item.receivedFrom}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{formatDate(item.issuedAt)}</td>
                  </tr>
                ))}
                {!receipts.length ? <tr><td colSpan={4}><span className="helper">No receipts issued yet.</span></td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      </RoleShell>
    </main>
  );
}
