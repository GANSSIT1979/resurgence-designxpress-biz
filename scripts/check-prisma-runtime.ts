import { db } from "../lib/db";

async function main() {
  const keys = ["quote", "quoteItem", "productCatalogItem", "productFlatPrice", "productTierPrice"] as const;

  for (const key of keys) {
    const exists = typeof (db as any)[key] !== "undefined";
    console.log(`${key}: ${exists ? "OK" : "MISSING"}`);
  }

  try {
    const count = await (db as any).productCatalogItem.count();
    console.log(`productCatalogItem.count(): ${count}`);
  } catch (error) {
    console.error("Runtime Prisma check failed:", error);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});