"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  catalogType: "SUBLI" | "DTF";
  name: string;
  description?: string | null;
  fabricProduct?: string | null;
  printType?: string | null;
  sizesLabel?: string | null;
  flatPrices: { pricingMode: string; amount: string }[];
  tierPrices: {
    pricingMode: string;
    sizeLabel: string;
    minQty: number;
    maxQty?: number | null;
    amount: string;
  }[];
};

type DraftItem = {
  productId: string;
  catalogType: "SUBLI" | "DTF";
  pricingMode: string;
  sizeLabel: string;
  qty: number;
};

export default function QuotationPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [vatRate, setVatRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [items, setItems] = useState<DraftItem[]>([
    { productId: "", catalogType: "SUBLI", pricingMode: "", sizeLabel: "", qty: 1 },
  ]);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]));
  }, []);

  const preview = useMemo(() => {
    const rows = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return { label: "Select product", qty: item.qty, unitPrice: 0, lineTotal: 0 };
      }

      if (product.catalogType === "SUBLI") {
        const fp = product.flatPrices.find((x) => x.pricingMode === item.pricingMode);
        const unitPrice = fp ? Number(fp.amount) : 0;

        return {
          label: product.name,
          qty: item.qty,
          unitPrice,
          lineTotal: unitPrice * item.qty,
        };
      }

      const tp = product.tierPrices.find((x) => {
        const max = x.maxQty ?? Number.MAX_SAFE_INTEGER;
        return (
          x.pricingMode === item.pricingMode &&
          x.sizeLabel === item.sizeLabel &&
          item.qty >= x.minQty &&
          item.qty <= max
        );
      });

      const unitPrice = tp ? Number(tp.amount) : 0;

      return {
        label: `${product.fabricProduct} - ${product.printType}`,
        qty: item.qty,
        unitPrice,
        lineTotal: unitPrice * item.qty,
      };
    });

    const subtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);
    const vatAmount = (subtotal - discount) * (vatRate / 100);
    const total = subtotal - discount + vatAmount;

    return { rows, subtotal, vatAmount, total };
  }, [items, products, discount, vatRate]);

   async function submitQuote() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          companyName,
          email,
          phone,
          address,
          notes,
          discount,
          vatRate,
          items,
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.quote) {
        setItems([
          { productId: "", catalogType: "SUBLI", pricingMode: "", sizeLabel: "", qty: 1 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="page-shell">
      <div className="container">
        <section className="section">
          <div className="section-heading">
            <div className="eyebrow">Quotation Engine</div>
            <h2>Automated Sales Quotation</h2>
            <p>
              Generate live quotations using your real Subli and DTF pricing catalog.
            </p>
          </div>
        </section>

        <section className="grid-2 section support-page-grid">
          <div className="form-card">
            <div className="card-title">Customer Details</div>

            <div>
              <label>Customer Name</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>

            <div>
              <label>Company Name</label>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>

            <div>
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div>
              <label>Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div>
              <label>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="card">
            <div className="card-title">Quotation Summary</div>

            <div className="list-stack">
              {preview.rows.map((row, index) => (
                <div className="list-item" key={index}>
                  <div>
                    <strong>{row.label}</strong>
                    <div className="muted">
                      Qty: {row.qty} · Unit: ₱{row.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>₱{row.lineTotal.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="section">
              <div className="list-item">
                <span>Subtotal</span>
                <strong>₱{preview.subtotal.toFixed(2)}</strong>
              </div>
              <div className="list-item">
                <span>VAT</span>
                <strong>₱{preview.vatAmount.toFixed(2)}</strong>
              </div>
              <div className="list-item">
                <span>Total</span>
                <strong>₱{preview.total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="card">
            <div className="card-title">Quote Items</div>

            <div className="list-stack">
              {items.map((item, index) => {
                const product = products.find((p) => p.id === item.productId);

                const sizeOptions =
                  product?.catalogType === "DTF"
                    ? [...new Set(product.tierPrices.map((x) => x.sizeLabel))]
                    : product?.sizesLabel
                    ? [product.sizesLabel]
                    : [];

                const pricingOptions =
                  product?.catalogType === "SUBLI"
                    ? product.flatPrices.map((x) => x.pricingMode)
                    : [...new Set(product?.tierPrices.map((x) => x.pricingMode) || [])];

                return (
                  <div className="crud-layout" key={index}>
                    <div className="crud-form">
                      <div>
                        <label>Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const chosen = products.find((p) => p.id === e.target.value);
                            const copy = [...items];
                            copy[index] = {
                              ...copy[index],
                              productId: e.target.value,
                              catalogType: (chosen?.catalogType || "SUBLI") as "SUBLI" | "DTF",
                              pricingMode: "",
                              sizeLabel: "",
                            };
                            setItems(copy);
                          }}
                        >
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.catalogType} - {p.catalogType === "DTF"
                                ? `${p.fabricProduct} - ${p.printType}`
                                : p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label>Pricing Mode</label>
                        <select
                          value={item.pricingMode}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[index].pricingMode = e.target.value;
                            setItems(copy);
                          }}
                        >
                          <option value="">Select pricing mode</option>
                          {pricingOptions.map((mode) => (
                            <option key={mode} value={mode}>
                              {mode}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="crud-form">
                      {product?.catalogType === "DTF" ? (
 			 <div>
    			<label>Size</label>
   			 <select
      			value={item.sizeLabel}
      			onChange={(e) => {
        		const copy = [...items];
        		copy[index].sizeLabel = e.target.value;
        		setItems(copy);
      			}}
  			  >
      			<option value="">Select size</option>
      			{sizeOptions.map((size) => (
        		<option key={size} value={size}>
          		{size}
        		</option>
      			))}
    			</select>
  			</div>
			) : (
  			<div>
   			 <label>Available Size Range</label>
   			 <input value={product?.sizesLabel || ""} readOnly />
 			 </div>
			)}

                      <div>
                        <label>Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[index].qty = Number(e.target.value || 1);
                            setItems(copy);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="inline-actions section">
              <button
                className="button button-secondary"
                type="button"
                onClick={() =>
                  setItems([
                    ...items,
                    { productId: "", catalogType: "SUBLI", pricingMode: "", sizeLabel: "", qty: 1 },
                  ])
                }
              >
                Add Item
              </button>
            </div>
          </div>
        </section>

        <section className="grid-2 section">
          <div className="form-card">
            <div>
              <label>Discount</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value || 0))}
              />
            </div>

            <div>
              <label>VAT %</label>
              <input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value || 0))}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">Actions</div>

            <div className="inline-actions">
              <button className="button" onClick={submitQuote} disabled={loading}>
                {loading ? "Creating..." : "Create Quote"}
              </button>
            </div>

            {result?.quote && (
              <p className="success-text section">
                Quote created successfully: <strong>{result.quote.quoteNumber}</strong>
              </p>
            )}

            {result?.error && (
              <p className="error-text section">{result.error}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}