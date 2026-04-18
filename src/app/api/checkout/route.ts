import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validation';
import { computeShippingFee } from '@/lib/shop';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid checkout payload.' }, { status: 400 });

  const ids = parsed.data.items.map((item) => item.productId);
  const products = await prisma.shopProduct.findMany({ where: { id: { in: ids }, isActive: true } });
  const productMap = new Map(products.map((product) => [product.id, product]));
  const quantityByProduct = new Map<string, number>();

  for (const item of parsed.data.items) {
    quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) || 0) + item.quantity);
  }

  for (const item of parsed.data.items) {
    const product = productMap.get(item.productId);
    if (!product) return NextResponse.json({ error: 'One or more products were not found.' }, { status: 400 });
    if (product.stock < (quantityByProduct.get(item.productId) || 0)) return NextResponse.json({ error: `${product.name} does not have enough stock.` }, { status: 400 });
  }

  const subtotal = parsed.data.items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);
  const shippingFee = computeShippingFee(subtotal);
  const totalAmount = subtotal + shippingFee;
  const orderNumber = `RSG-${Date.now().toString().slice(-8)}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.shopOrder.create({
      data: {
        orderNumber,
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2 || null,
        city: parsed.data.city,
        province: parsed.data.province || null,
        postalCode: parsed.data.postalCode || null,
        notes: parsed.data.notes || null,
        paymentMethod: parsed.data.paymentMethod,
        status: parsed.data.paymentMethod === 'COD' ? 'PENDING' : 'AWAITING_PAYMENT',
        paymentStatus: 'PENDING',
        subtotal,
        shippingFee,
        totalAmount,
        items: {
          create: parsed.data.items.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              imageUrl: product.imageUrl,
              variantLabel: item.variantLabel || null,
              price: product.price,
              quantity: item.quantity,
              lineTotal: product.price * item.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    for (const [productId, quantity] of quantityByProduct.entries()) {
      await tx.shopProduct.update({ where: { id: productId }, data: { stock: { decrement: quantity } } });
    }

    return created;
  });

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 });
}
