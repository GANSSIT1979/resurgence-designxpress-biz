import { InvoiceManager } from '@/components/forms/invoice-manager';
import { RoleShell } from '@/components/role-shell';
import { cashierNavItems } from '@/lib/cashier';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [invoices, sponsors] = await Promise.all([
    prisma.invoice.findMany({ orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }] }),
    prisma.sponsor.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
  ]);

  return (
    <main>
      <RoleShell roleLabel="Cashier" title="Invoices" description="Create billing records, monitor receivables, and manage sponsor package invoicing." navItems={cashierNavItems as any} currentPath="/cashier/invoices">
        <InvoiceManager
          initialItems={invoices.map((item) => ({
            ...item,
            issueDate: item.issueDate.toISOString(),
            dueDate: item.dueDate ? item.dueDate.toISOString() : null,
            contactName: item.contactName ?? null,
            email: item.email ?? null,
            tier: item.tier ?? null,
            notes: item.notes ?? null,
            sponsorId: item.sponsorId ?? null,
          }))}
          sponsors={sponsors.map((item) => ({ id: item.id, name: item.name, tier: item.tier }))}
        />
      </RoleShell>
    </main>
  );
}
