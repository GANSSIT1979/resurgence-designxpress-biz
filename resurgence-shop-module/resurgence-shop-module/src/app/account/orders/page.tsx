import { redirect } from 'next/navigation';
import { db } from '@/lib/shop/db';
import { getCurrentUser } from '@/lib/shop/session';

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const orders = await db.shopOrder.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-bold">My Orders</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-zinc-400">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₱{Number(order.totalAmount).toLocaleString()}</p>
                  <p className="text-sm text-zinc-400">{order.orderStatus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
