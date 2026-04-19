'use client';

import { useState } from 'react';
import { addProductToCart } from '@/lib/shop/cart-storage';

export function AddToCartButton({
  product,
  quantity = 1,
  variantLabel = '',
}: {
  product: any;
  quantity?: number;
  variantLabel?: string;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  function onAdd() {
    const result = addProductToCart(product, quantity, variantLabel);

    if (!result.ok && result.reason === 'sold-out') {
      setNotice('This merch item is currently sold out.');
      window.setTimeout(() => setNotice(null), 2200);
      return;
    }

    if (!result.ok) {
      setNotice('Unable to add this merch item to cart.');
      window.setTimeout(() => setNotice(null), 2200);
      return;
    }

    const normalizedVariant = variantLabel.trim();
    setNotice(result.capped ? 'Cart quantity matches available stock.' : normalizedVariant ? `Added to cart: ${normalizedVariant}.` : 'Added to cart.');
    window.setTimeout(() => setNotice(null), 1800);
  }

  return (
    <div>
      <button className="btn" type="button" onClick={onAdd} disabled={product.stock <= 0}>{product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}</button>
      {notice ? <div className="helper" style={{ marginTop: 8 }}>{notice}</div> : null}
    </div>
  );
}
