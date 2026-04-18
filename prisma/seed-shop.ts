import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const apparel = await prisma.shopCategory.upsert({
    where: { slug: 'apparel' },
    update: {},
    create: {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Official Resurgence apparel.'
    }
  });

  await prisma.shopProduct.upsert({
    where: { slug: 'resurgence-jersey-black-red' },
    update: {},
    create: {
      name: 'Resurgence Jersey',
      slug: 'resurgence-jersey-black-red',
      sku: 'RS-JSY-001',
      shortDescription: 'Official black and red jersey.',
      description: 'Performance jersey for official Resurgence merchandise.',
      price: 1299,
      compareAtPrice: 1599,
      stock: 50,
      isActive: true,
      isFeatured: true,
      categoryId: apparel.id,
      imageUrl: '/branding/resurgence-shop-mockup.png'
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
