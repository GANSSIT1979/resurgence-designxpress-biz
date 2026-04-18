import { db } from './db';

export async function getCart(userId: string) {
  const items = await db.shopCartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  return {
    items,
    subtotal,
    shippingFee: items.length > 0 ? 120 : 0,
    total: subtotal + (items.length > 0 ? 120 : 0)
  };
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const existing = await db.shopCartItem.findUnique({
    where: { userId_productId: { userId, productId } }
  });

  if (existing) {
    return db.shopCartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity }
    });
  }

  return db.shopCartItem.create({
    data: { userId, productId, quantity }
  });
}

export async function updateCartItem(id: string, quantity: number) {
  if (quantity <= 0) {
    return db.shopCartItem.delete({ where: { id } });
  }

  return db.shopCartItem.update({
    where: { id },
    data: { quantity }
  });
}

export async function removeCartItem(id: string) {
  return db.shopCartItem.delete({ where: { id } });
}
