import AdminProductTable from '@/components/shop/AdminProductTable';
import { db } from '@/lib/shop/db';

export default async function AdminProductsPage() {
  const products = await db.shopProduct.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Products</h1>
          <a href="/shop" className="rounded-xl bg-zinc-950 px-5 py-3 text-white">View Store</a>
        </div>
        <AdminProductTable products={products} />
      </div>
    </main>
  );
}
