'use client';

import { useMemo, useState } from 'react';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';

type MerchProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  availableSizes?: string | null;
  availableColors?: string | null;
};

function splitOptions(value?: string | null) {
  if (!value) return [];
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function buildVariantLabel(size: string, color: string) {
  return [
    size ? `Size: ${size}` : '',
    color ? `Color: ${color}` : '',
  ].filter(Boolean).join(' / ');
}

export function MerchPurchasePanel({ product }: { product: MerchProduct }) {
  const sizes = useMemo(() => splitOptions(product.availableSizes), [product.availableSizes]);
  const colors = useMemo(() => splitOptions(product.availableColors), [product.availableColors]);
  const [size, setSize] = useState(sizes[0] || '');
  const [color, setColor] = useState(colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const variantLabel = buildVariantLabel(size, color);
  const isSoldOut = product.stock <= 0;

  return (
    <div className="merch-purchase-panel">
      <div className="merch-purchase-header">
        <div>
          <div className="section-kicker">Official Merch Checkout</div>
          <h3>Choose your fit</h3>
        </div>
        <span className={`status-pill ${isSoldOut ? 'status-CANCELLED' : 'status-DELIVERED'}`}>
          {isSoldOut ? 'Sold out' : `${product.stock} in stock`}
        </span>
      </div>

      {sizes.length ? (
        <div>
          <label className="label">Size</label>
          <div className="merch-option-grid">
            {sizes.map((item) => (
              <button
                className={size === item ? 'merch-option active' : 'merch-option'}
                key={item}
                type="button"
                onClick={() => setSize(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {colors.length ? (
        <div>
          <label className="label">Color</label>
          <div className="merch-option-grid">
            {colors.map((item) => (
              <button
                className={color === item ? 'merch-option active' : 'merch-option'}
                key={item}
                type="button"
                onClick={() => setColor(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <label className="label">Quantity</label>
        <input
          className="input"
          disabled={isSoldOut}
          max={Math.max(1, product.stock)}
          min="1"
          style={{ maxWidth: 150 }}
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(Math.min(Math.max(1, Number(event.target.value || 1)), Math.max(1, product.stock)))}
        />
      </div>

      <div className="merch-purchase-summary">
        <span>Selected</span>
        <strong>{variantLabel || 'Standard merch item'}</strong>
      </div>

      <div className="btn-row">
        <AddToCartButton product={product} quantity={quantity} variantLabel={variantLabel} />
      </div>
      <p className="helper">
        Payments support Cash on Delivery, GCash, Maya, Bank Transfer, Credit/Debit Card, and Cash. Shipping covers the Philippines nationwide.
      </p>
    </div>
  );
}
