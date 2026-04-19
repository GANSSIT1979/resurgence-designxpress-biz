export const CART_STORAGE_KEY = 'resurgence_cart';
export const CART_UPDATED_EVENT = 'resurgence-cart-updated';

export type StoredCartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  variantLabel?: string;
};

export type CartProductInput = {
  id?: string | null;
  productId?: string | null;
  slug?: string | null;
  name: string;
  price: number | null;
  stock?: number | null;
  imageUrl?: string | null;
};

export function cartKey(item: Pick<StoredCartItem, 'productId' | 'variantLabel'>) {
  return `${item.productId}:${item.variantLabel || 'standard'}`;
}

export function readCart(): StoredCartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isStoredCartItem) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: StoredCartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function clearCart() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartItemCount(items = readCart()) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function addProductToCart(product: CartProductInput, quantity = 1, variantLabel = '') {
  const productId = product.productId || product.id || '';
  const price = Number(product.price ?? 0);
  const stock = product.stock ?? Number.MAX_SAFE_INTEGER;
  const normalizedQuantity = Math.max(1, Math.floor(quantity || 1));
  const normalizedVariant = variantLabel.trim();

  if (!productId || !product.name || !Number.isFinite(price) || price <= 0) {
    return { ok: false as const, reason: 'missing-product' as const, cart: readCart() };
  }

  if (stock <= 0) {
    return { ok: false as const, reason: 'sold-out' as const, cart: readCart() };
  }

  const cart = readCart();
  const existing = cart.find((item) => item.productId === productId && (item.variantLabel || '') === normalizedVariant);
  const requestedQuantity = (existing?.quantity || 0) + normalizedQuantity;
  const nextQuantity = Math.min(stock, requestedQuantity);

  if (existing) {
    existing.quantity = nextQuantity;
  } else {
    cart.push({
      productId,
      slug: product.slug || productId,
      name: product.name,
      price,
      quantity: nextQuantity,
      imageUrl: product.imageUrl || '/assets/resurgence-poster.jpg',
      variantLabel: normalizedVariant,
    });
  }

  writeCart(cart);

  return {
    ok: true as const,
    cart,
    capped: nextQuantity < requestedQuantity,
    quantity: nextQuantity,
  };
}

function isStoredCartItem(value: unknown): value is StoredCartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as StoredCartItem;
  return Boolean(item.productId && item.name && Number.isFinite(Number(item.price)) && Number.isFinite(Number(item.quantity)));
}
