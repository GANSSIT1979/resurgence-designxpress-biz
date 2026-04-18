import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/shop/product-card';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const products = await prisma.shopProduct.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <main className="section">
      <div className="container">
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-kicker">Official Resurgence Merch</div>
          <h1 className="section-title" style={{ marginBottom: 12 }}>Shop Resurgence powered by DesignXpress</h1>
          <p className="section-copy">Functional eCommerce module with live product catalog, cart, checkout, payment selection, and admin order management inside your current Resurgence platform.</p>
        </div>
        <div className="card-grid grid-3">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </main>
  );
}
