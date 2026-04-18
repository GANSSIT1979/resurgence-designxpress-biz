import AdminOrderTable from '@/components/shop/AdminOrderTable';
import { db } from '@/lib/shop/db';

export default async function AdminOrdersPage() {
  const orders = await db.shopOrder.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-4xl font-bold">Orders</h1>
        <AdminOrderTable orders={orders} />
      </div>
    </main>
  );
}
