import { AdminShell } from '@/components/admin-shell';
import { ProductServiceManager } from '@/components/forms/product-service-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ProductServicesPage() {
  const items = await prisma.productService.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });

  return (
    <main>
      <AdminShell
        title="Products and Services"
        description="Manage the live products and services catalog used by the public Services page and future product/service workflows."
        currentPath="/admin/product-services"
      >
        <ProductServiceManager
          initialItems={items.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description,
            features: item.features,
            priceLabel: item.priceLabel,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
          }))}
        />
      </AdminShell>
    </main>
  );
}
