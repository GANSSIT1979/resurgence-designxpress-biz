import { prisma } from '@/lib/prisma';

export function formatPeso(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

export async function getFeaturedShopProducts(limit = 4) {
  return prisma.shopProduct.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  });
}

export function computeShippingFee(subtotal: number) {
  if (subtotal >= 5000) return 0;
  if (subtotal >= 2500) return 120;
  return 180;
}
