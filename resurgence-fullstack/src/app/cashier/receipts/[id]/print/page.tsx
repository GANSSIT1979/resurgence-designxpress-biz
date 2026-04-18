import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminPrintButton } from '@/components/admin-print-button';
import { formatCurrency, formatDate } from '@/lib/cashier';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ReceiptPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      invoice: true,
      transaction: true,
    },
  });

  if (!receipt) notFound();

  return (
    <main className="print-sheet">
      <div className="btn-row" style={{ marginBottom: 18 }}>
        <Link className="button-link btn-secondary" href="/cashier/receipts">Back to receipts</Link>
        <AdminPrintButton label="Print / Save PDF" />
      </div>

      <h1>Receipt {receipt.receiptNumber}</h1>
      <p>{receipt.companyName}</p>

      <div className="card-grid grid-2" style={{ marginTop: 20 }}>
        <section className="card">
          <div className="section-kicker">Receipt Details</div>
          <div className="helper">Received from: {receipt.receivedFrom}</div>
          <div className="helper">Issued at: {formatDate(receipt.issuedAt)}</div>
          <div className="helper">Payment method: {receipt.paymentMethod.replaceAll('_', ' ')}</div>
          <div className="helper">Invoice: {receipt.invoice?.invoiceNumber || 'Not linked'}</div>
          <div className="helper">Transaction: {receipt.transaction?.transactionNumber || 'Not linked'}</div>
        </section>

        <section className="card">
          <div className="section-kicker">Amount</div>
          <div className="panel"><strong>{formatCurrency(receipt.amount)}</strong><div className="helper">Receipt amount</div></div>
          {receipt.notes ? <div className="helper" style={{ marginTop: 12 }}>Notes: {receipt.notes}</div> : null}
        </section>
      </div>
    </main>
  );
}

