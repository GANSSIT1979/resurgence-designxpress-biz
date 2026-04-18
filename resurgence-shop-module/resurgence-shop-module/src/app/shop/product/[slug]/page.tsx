import { notFound } from 'next/navigation';
import { db } from '@/lib/shop/db';

export default async function ShopProductPage({ params }: { params: { slug: string } }) {
  const product = await db.shopProduct.findUnique({ where: { slug: params.slug } });
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
          <img src={product.imageUrl || '/branding/resurgence-logo.jpg'} alt={product.name} className="w-full object-cover" />
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-red-500">Official Merchandise</p>
          <h1 className="mt-3 text-4xl font-bold">{product.name}</h1>
          <p className="mt-4 text-zinc-400">{product.description || product.shortDescription}</p>
          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl font-bold">₱{Number(product.price).toLocaleString()}</span>
            {product.compareAtPrice ? (
              <span className="text-lg text-zinc-500 line-through">₱{Number(product.compareAtPrice).toLocaleString()}</span>
            ) : null}
          </div>
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300">
            Stock available: {product.stock}
          </div>
          <form action="/api/cart" method="post" className="mt-8 space-y-4">
            <input type="hidden" name="productId" value={product.id} />
            <input type="number" name="quantity" min={1} defaultValue={1} className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3" />
            <button className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-500">Add to Cart</button>
          </form>
        </div>
      </div>
    </main>
  );
}
