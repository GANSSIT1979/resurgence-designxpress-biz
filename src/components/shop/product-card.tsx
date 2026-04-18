'use client';

import Link from 'next/link';

function formatPeso(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
}

function optionPreview(value?: string | null) {
  if (!value) return '';
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean).slice(0, 4).join(', ');
}

export function ProductCard({ product }: { product: any }) {
  const sizes = optionPreview(product.availableSizes);
  const colors = optionPreview(product.availableColors);
  const stockLabel = product.stock > 0 ? `${product.stock} in stock` : 'Sold out';

  return (
    <article className="card shop-product-card">
      <Link className="shop-product-media" href={`/shop/product/${product.slug}`}>
        <img
          src={product.imageUrl || '/assets/resurgence-poster.jpg'}
          alt={product.name}
          className="shop-product-image"
        />
        <span className={product.stock > 0 ? 'merch-stock-badge' : 'merch-stock-badge sold-out'}>{stockLabel}</span>
      </Link>
      <div className="shop-product-body">
        <div className="merch-card-meta">
          <span>{product.category?.name || 'Official Merch'}</span>
          {product.isOfficialMerch ? <span>Authentic</span> : null}
        </div>
        <h3 style={{ marginBottom: 8 }}>{product.name}</h3>
        <p className="helper" style={{ minHeight: 48 }}>{product.shortDescription || product.description}</p>
        <div className="shop-price-row">
          <strong>{formatPeso(product.price)}</strong>
          {product.compareAtPrice ? <span className="shop-price-old">{formatPeso(product.compareAtPrice)}</span> : null}
        </div>
        <div className="merch-option-preview">
          <span>{product.badgeLabel || 'Official Resurgence Drop'}</span>
          {sizes ? <span>Sizes: {sizes}</span> : null}
          {colors ? <span>Colors: {colors}</span> : null}
        </div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <Link href={`/shop/product/${product.slug}`} className="button-link">{product.stock > 0 ? 'View Drop' : 'View Details'}</Link>
          <Link href="/cart" className="button-link btn-secondary">Cart</Link>
        </div>
      </div>
    </article>
  );
}
