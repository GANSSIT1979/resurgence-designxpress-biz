import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { formatPeso } from '@/lib/shop';

export const dynamic = 'force-dynamic';

export default async function ShopProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.shopProduct.findUnique({ where: { slug }, include: { category: true } });
  if (!product || !product.isActive) notFound();

  return (
    <main className="section">
      <div className="container split">
        <section className="card">
          <img src={product.imageUrl || '/assets/resurgence-poster.jpg'} alt={product.name} className="shop-detail-image" />
        </section>
        <section className="card">
          <div className="section-kicker">{product.category?.name || 'Official Merch'}</div>
          <h1 className="section-title" style={{ fontSize: '2.8rem' }}>{product.name}</h1>
          <p className="section-copy">{product.description}</p>
          <div className="shop-price-row" style={{ marginTop: 18 }}>
            <strong>{formatPeso(product.price)}</strong>
            {product.compareAtPrice ? <span className="shop-price-old">{formatPeso(product.compareAtPrice)}</span> : null}
          </div>
          <div className="helper" style={{ marginTop: 10 }}>Stock available: {product.stock}</div>
          <div className="btn-row" style={{ marginTop: 18 }}>
            <AddToCartButton product={product} />
          </div>
        </section>
      </div>
    </main>
  );
}
