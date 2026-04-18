import { AdminShell } from '@/components/admin-shell';
import { ShopOrderManager } from '@/components/forms/shop-order-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const items = await prisma.shopOrder.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  return (
    <main>
      <AdminShell title="Shop Orders" description="Review customer orders, update fulfillment status, and control payment confirmation for the Resurgence commerce workflow." currentPath="/admin/orders">
        <ShopOrderManager initialItems={JSON.parse(JSON.stringify(items))} />
      </AdminShell>
    </main>
  );
}
