import { ReceiptManager } from '@/components/forms/receipt-manager';
import { RoleShell } from '@/components/role-shell';
import { cashierNavItems } from '@/lib/cashier';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [receipts, invoices, transactions] = await Promise.all([
    prisma.receipt.findMany({ orderBy: [{ issuedAt: 'desc' }, { createdAt: 'desc' }] }),
    prisma.invoice.findMany({ orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }] }),
    prisma.cashierTransaction.findMany({ orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }] }),
  ]);

  return (
    <main>
      <RoleShell roleLabel="Cashier" title="Receipts" description="Issue and maintain official receipts tied to sponsor collections and billing history." navItems={cashierNavItems as any} currentPath="/cashier/receipts">
        <ReceiptManager
          initialItems={receipts.map((item) => ({
            ...item,
            issuedAt: item.issuedAt.toISOString(),
            notes: item.notes ?? null,
            invoiceId: item.invoiceId ?? null,
            transactionId: item.transactionId ?? null,
          }))}
          invoices={invoices.map((item) => ({ id: item.id, invoiceNumber: item.invoiceNumber, companyName: item.companyName, balanceAmount: item.balanceAmount }))}
          transactions={transactions.map((item) => ({ id: item.id, transactionNumber: item.transactionNumber, companyName: item.companyName, amount: item.amount, paymentMethod: item.paymentMethod }))}
        />
      </RoleShell>
    </main>
  );
}
