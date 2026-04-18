import Link from 'next/link';
import { formatPeso } from '@/lib/shop';

export function ProductCard({ product }: { product: any }) {
  return (
    <article className="card shop-product-card">
      <Link href={`/shop/product/${product.slug}`}>
        <img
          src={product.imageUrl || '/assets/resurgence-poster.jpg'}
          alt={product.name}
          className="shop-product-image"
        />
      </Link>
      <div className="shop-product-body">
        <div className="helper">{product.category?.name || 'Official Merch'}</div>
        <h3 style={{ marginBottom: 8 }}>{product.name}</h3>
        <p className="helper" style={{ minHeight: 48 }}>{product.shortDescription || product.description}</p>
        <div className="shop-price-row">
          <strong>{formatPeso(product.price)}</strong>
          {product.compareAtPrice ? <span className="shop-price-old">{formatPeso(product.compareAtPrice)}</span> : null}
        </div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <Link href={`/shop/product/${product.slug}`} className="button-link">View Product</Link>
        </div>
      </div>
    </article>
  );
}
