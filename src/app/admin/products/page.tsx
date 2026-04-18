import { AdminShell } from '@/components/admin-shell';
import { ShopProductManager } from '@/components/forms/shop-product-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [items, categories] = await Promise.all([
    prisma.shopProduct.findMany({ include: { category: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
    prisma.shopCategory.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
  ]);

  return (
    <main>
      <AdminShell title="Official Resurgence Merch" description="Manage the live merch catalog, official drops, images, variants, pricing, stock, and featured storefront products." currentPath="/admin/products">
        <ShopProductManager initialItems={items as any} categories={categories} />
      </AdminShell>
    </main>
  );
}
