import { prisma } from '@/lib/prisma';
import { MerchShopClient } from '@/components/shop/merch-shop-client';

export const dynamic = 'force-dynamic';

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

export default async function ShopPage() {
  let products: Awaited<ReturnType<typeof prisma.shopProduct.findMany>> = [];

  if (hasUsableDatabaseUrl()) {
    try {
      products = await prisma.shopProduct.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
    } catch (error) {
      console.error('[shop-page] Falling back to an empty merch catalog.', error);
    }
  } else {
    console.warn('[shop-page] DATABASE_URL is missing or still uses HOST placeholder. Rendering empty merch catalog.');
  }

  return (
    <main className="section">
      <div className="container">
        <MerchShopClient products={JSON.parse(JSON.stringify(products))} />
      </div>
    </main>
  );
}
