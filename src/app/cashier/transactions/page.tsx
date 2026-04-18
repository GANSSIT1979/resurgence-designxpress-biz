import { TransactionManager } from '@/components/forms/transaction-manager';
import { RoleShell } from '@/components/role-shell';
import { cashierNavItems } from '@/lib/cashier';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [transactions, invoices] = await Promise.all([
    prisma.cashierTransaction.findMany({ orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }] }),
    prisma.invoice.findMany({ orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }] }),
  ]);

  return (
    <main>
      <RoleShell roleLabel="Cashier" title="Transactions" description="Record sponsor collections, refunds, and adjustments with linked invoice balance updates." navItems={cashierNavItems as any} currentPath="/cashier/transactions">
        <TransactionManager
          initialItems={transactions.map((item) => ({
            ...item,
            transactionDate: item.transactionDate.toISOString(),
            referenceNumber: item.referenceNumber ?? null,
            notes: item.notes ?? null,
          }))}
          invoices={invoices.map((item) => ({
            id: item.id,
            invoiceNumber: item.invoiceNumber,
            companyName: item.companyName,
            balanceAmount: item.balanceAmount,
            status: item.status,
          }))}
        />
      </RoleShell>
    </main>
  );
}
