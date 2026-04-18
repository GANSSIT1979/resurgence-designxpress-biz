'use client';

import { useState } from 'react';

type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  variantLabel?: string;
};

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
    if (product.stock <= 0) {
      setNotice('This merch item is currently sold out.');
      window.setTimeout(() => setNotice(null), 2200);
      return;
    }

    const raw = window.localStorage.getItem('resurgence_cart');
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    const normalizedVariant = variantLabel.trim();
    const existing = cart.find((item) => item.productId === product.id && (item.variantLabel || '') === normalizedVariant);
    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + quantity);
    } else {
      cart.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity: Math.min(product.stock, quantity),
        imageUrl: product.imageUrl || '/assets/resurgence-poster.jpg',
        variantLabel: normalizedVariant,
      });
    }
    window.localStorage.setItem('resurgence_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('resurgence-cart-updated'));
    setNotice(normalizedVariant ? `Added to cart: ${normalizedVariant}.` : 'Added to cart.');
    window.setTimeout(() => setNotice(null), 1800);
  }

  return (
    <div>
      <button className="btn" type="button" onClick={onAdd} disabled={product.stock <= 0}>{product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}</button>
      {notice ? <div className="helper" style={{ marginTop: 8 }}>{notice}</div> : null}
    </div>
  );
}
