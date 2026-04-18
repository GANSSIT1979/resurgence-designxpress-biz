import { prisma } from '@/lib/prisma';
import { MerchShopClient } from '@/components/shop/merch-shop-client';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const products = await prisma.shopProduct.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <main className="section">
      <div className="container">
        <MerchShopClient products={JSON.parse(JSON.stringify(products))} />
      </div>
    </main>
  );
}
