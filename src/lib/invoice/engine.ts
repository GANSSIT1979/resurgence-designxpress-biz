import {
  PRODUCT_CATALOG,
  InvoiceCalculation,
  InvoiceCalculationInput,
  InvoiceItem,
} from './config';

export function getUnitPrice(productCode: string, qty: number) {
  const product = PRODUCT_CATALOG.find((p) => p.code === productCode);
  if (!product) throw new Error('Product not found');

  const tier = product.pricing
    .sort((a, b) => b.minQty - a.minQty)
    .find((p) => qty >= p.minQty);

  return tier ? tier.price : product.pricing[0].price;
}

export function createInvoice(input: InvoiceCalculationInput): InvoiceCalculation {
  const items: InvoiceItem[] = input.items.map((i) => {
    const product = PRODUCT_CATALOG.find((p) => p.code === i.productCode);
    if (!product) throw new Error(`Invalid product: ${i.productCode}`);

    const unitPrice = getUnitPrice(i.productCode, i.qty);

    return {
      productCode: i.productCode,
      name: product.name,
      category: product.category,
      qty: i.qty,
      unitPrice,
      total: unitPrice * i.qty,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const discount = input.discount || 0;
  const shipping = input.shipping || 0;

  return {
    items,
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
    currency: 'PHP',
    paymentOptions: {
      allowPartial: true,
      allowTips: false,
      methods: ['Cash', 'GCash', 'Maya', 'Bank Transfer', 'PayPal'],
    },
  };
}
