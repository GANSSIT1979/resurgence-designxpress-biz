'use client';

import { useState } from 'react';

type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export function AddToCartButton({ product, quantity = 1 }: { product: any; quantity?: number }) {
  const [notice, setNotice] = useState<string | null>(null);

  function onAdd() {
    const raw = window.localStorage.getItem('resurgence_cart');
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl || '/assets/resurgence-poster.jpg',
      });
    }
    window.localStorage.setItem('resurgence_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('resurgence-cart-updated'));
    setNotice('Added to cart.');
    window.setTimeout(() => setNotice(null), 1800);
  }

  return (
    <div>
      <button className="btn" type="button" onClick={onAdd}>Add to Cart</button>
      {notice ? <div className="helper" style={{ marginTop: 8 }}>{notice}</div> : null}
    </div>
  );
}
