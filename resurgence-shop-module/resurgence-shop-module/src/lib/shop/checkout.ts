import { db } from './db';
import { getCart } from './cart';
import type { CheckoutInput } from './types';

function makeOrderNumber() {
  return `RS-${Date.now()}`;
}

export async function createOrderFromCart(userId: string, input: CheckoutInput) {
  const cart = await getCart(userId);

  if (!cart.items.length) {
    throw new Error('Cart is empty');
  }

  for (const line of cart.items) {
    if (!line.product.isActive) {
      throw new Error(`Product unavailable: ${line.product.name}`);
    }
    if (line.product.stock < line.quantity) {
      throw new Error(`Insufficient stock for ${line.product.name}`);
    }
  }

  const order = await db.$transaction(async (tx) => {
    const created = await tx.shopOrder.create({
      data: {
        orderNumber: makeOrderNumber(),
        userId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        addressLine1: input.addressLine1,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        subtotal: cart.subtotal,
        shippingFee: cart.shippingFee,
        totalAmount: cart.total,
        notes: input.notes,
        paymentMethod: input.paymentMethod,
        orderStatus: input.paymentMethod === 'COD' ? 'PROCESSING' : 'AWAITING_PAYMENT',
        paymentStatus: input.paymentMethod === 'COD' ? 'PENDING' : 'PENDING'
      }
    });

    for (const line of cart.items) {
      await tx.shopOrderItem.create({
        data: {
          orderId: created.id,
          productId: line.productId,
          productName: line.product.name,
          unitPrice: line.product.price,
          quantity: line.quantity,
          totalPrice: Number(line.product.price) * line.quantity
        }
      });

      await tx.shopProduct.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } }
      });
    }

    await tx.shopCartItem.deleteMany({ where: { userId } });

    return created;
  });

  return order;
}
