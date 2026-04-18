import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminPrintButton } from '@/components/admin-print-button';
import { formatCurrency, formatDate } from '@/lib/cashier';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      transactions: { orderBy: [{ transactionDate: 'desc' }] },
      receipts: { orderBy: [{ issuedAt: 'desc' }] },
      sponsor: true,
    },
  });

  if (!invoice) notFound();

  return (
    <main className="print-sheet">
      <div className="btn-row" style={{ marginBottom: 18 }}>
        <Link className="button-link btn-secondary" href="/cashier/invoices">Back to invoices</Link>
        <AdminPrintButton label="Print / Save PDF" />
      </div>

      <h1>Invoice {invoice.invoiceNumber}</h1>
      <p>{invoice.companyName}</p>

      <div className="card-grid grid-2" style={{ marginTop: 20 }}>
        <section className="card">
          <div className="section-kicker">Invoice Details</div>
          <div className="helper">Issue date: {formatDate(invoice.issueDate)}</div>
          <div className="helper">Due date: {formatDate(invoice.dueDate)}</div>
          <div className="helper">Status: {invoice.status.replaceAll('_', ' ')}</div>
          <div className="helper">Sponsor: {invoice.sponsor?.name || 'Not linked'}</div>
          <div className="helper">Billing contact: {invoice.contactName || invoice.companyName}</div>
          <div className="helper">Email: {invoice.email || 'Not provided'}</div>
        </section>

        <section className="card">
          <div className="section-kicker">Amounts</div>
          <div className="panel"><strong>{formatCurrency(invoice.amount)}</strong><div className="helper">Invoice total</div></div>
          <div className="panel" style={{ marginTop: 12 }}><strong>{formatCurrency(invoice.balanceAmount)}</strong><div className="helper">Remaining balance</div></div>
          <div className="panel" style={{ marginTop: 12 }}><strong>{invoice.tier || 'Custom billing'}</strong><div className="helper">Package tier</div></div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-kicker">Description</div>
        <p>{invoice.description}</p>
        {invoice.notes ? <p className="helper">Notes: {invoice.notes}</p> : null}
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-kicker">Transaction History</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Kind</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoice.transactions.map((item) => (
                <tr key={item.id}>
                  <td>{item.transactionNumber}</td>
                  <td>{item.kind.replaceAll('_', ' ')}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{formatDate(item.transactionDate)}</td>
                </tr>
              ))}
              {!invoice.transactions.length ? <tr><td colSpan={4}><span className="helper">No transactions linked.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-kicker">Receipt History</div>
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
              {invoice.receipts.map((item) => (
                <tr key={item.id}>
                  <td>{item.receiptNumber}</td>
                  <td>{item.receivedFrom}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{formatDate(item.issuedAt)}</td>
                </tr>
              ))}
              {!invoice.receipts.length ? <tr><td colSpan={4}><span className="helper">No receipts linked.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

