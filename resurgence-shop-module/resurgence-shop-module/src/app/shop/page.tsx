import ProductCard from '@/components/shop/ProductCard';
import { db } from '@/lib/shop/db';

export default async function ShopPage() {
  const products = await db.shopProduct.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-red-500">Resurgence Shop</p>
              <h1 className="mt-3 text-4xl font-bold md:text-5xl">Rise. Unite. Resurge.</h1>
              <p className="mt-4 max-w-2xl text-zinc-400">
                Official merchandise, apparel, accessories, and future drop collections for Resurgence powered by DesignXpress.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-zinc-800">
              <img src="/branding/resurgence-shop-mockup.png" alt="Resurgence shop preview" className="w-full object-cover" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <span className="text-sm text-zinc-400">{products.length} item(s)</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
