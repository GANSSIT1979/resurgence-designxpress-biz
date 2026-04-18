const base = "http://localhost:3000";

async function main() {
  const catalogRes = await fetch(`${base}/api/catalog`);
  const catalog = await catalogRes.json();

  if (!catalog?.products?.length) {
    throw new Error("No catalog products found.");
  }

  const product = catalog.products.find((p: any) => p.catalogType === "SUBLI" && p.flatPrices?.length > 0)
    || catalog.products[0];

  const pricingMode =
    product.catalogType === "SUBLI"
      ? product.flatPrices[0]?.pricingMode
      : product.tierPrices[0]?.pricingMode;

  const sizeLabel =
    product.catalogType === "DTF"
      ? product.tierPrices[0]?.sizeLabel
      : "";

  const payload = {
    customerName: "Automation Test",
    companyName: "RESURGENCE QA",
    email: "qa@example.com",
    phone: "09170000000",
    address: "Test Address",
    notes: "Automated quote creation test",
    discount: 0,
    vatRate: 0,
    items: [
      {
        productId: product.id,
        catalogType: product.catalogType,
        pricingMode,
        sizeLabel,
        qty: 1,
      },
    ],
  };

  const res = await fetch(`${base}/api/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));

  if (!res.ok) {
    throw new Error(json?.error || "Quote creation failed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});