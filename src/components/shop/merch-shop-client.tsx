'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/shop/product-card';

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string | null;
  badgeLabel: string | null;
  material: string | null;
  availableSizes: string | null;
  availableColors: string | null;
  isFeatured: boolean;
  isOfficialMerch: boolean;
  createdAt: string | Date;
  category: { id: string; name: string; slug: string } | null;
};

export function MerchShopClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('featured');
  const deferredSearch = useDeferredValue(search);

  const categories = useMemo(() => {
    const names = new Map<string, string>();
    products.forEach((product) => {
      if (product.category?.slug) names.set(product.category.slug, product.category.name);
    });
    return Array.from(names.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const next = products.filter((product) => {
      const matchesSearch = !q || [
        product.name,
        product.sku || '',
        product.shortDescription || '',
        product.description,
        product.category?.name || '',
        product.badgeLabel || '',
      ].join(' ').toLowerCase().includes(q);
      const matchesCategory = category === 'all' || product.category?.slug === category;
      const matchesAvailability = availability === 'all' || (availability === 'available' ? product.stock > 0 : product.stock <= 0);
      return matchesSearch && matchesCategory && matchesAvailability;
    });

    return next.sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'stock') return b.stock - a.stock;
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return Number(b.isFeatured) - Number(a.isFeatured) || a.name.localeCompare(b.name);
    });
  }, [availability, category, deferredSearch, products, sort]);

  const officialDrops = products.filter((product) => product.isOfficialMerch).length;
  const readyDrops = products.filter((product) => product.stock > 0).length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <>
      <section className="merch-hero-card">
        <div>
          <span className="badge">Official Resurgence Merch</span>
          <h1 className="section-title">Court-ready drops powered by DesignXpress.</h1>
          <p className="section-copy">
            Shop jerseys, tees, hoodies, caps, creator drops, and accessories from the same Resurgence platform that manages creators, sponsors, and customer support.
          </p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/cart" className="button-link">View Cart</Link>
            <Link href="/account/orders" className="button-link btn-secondary">Track Orders</Link>
          </div>
        </div>
        <div className="merch-hero-panel">
          <div className="section-kicker">Merch Desk</div>
          <h3>Philippines nationwide shipping</h3>
          <p className="helper">Payment methods: GCash, Maya, Bank Transfer, Credit/Debit Card, Cash, and Cash on Delivery.</p>
          <div className="merch-stat-grid">
            <div><strong>{products.length}</strong><span>Total items</span></div>
            <div><strong>{readyDrops}</strong><span>Available drops</span></div>
            <div><strong>{totalStock}</strong><span>Units in stock</span></div>
            <div><strong>{officialDrops}</strong><span>Official merch</span></div>
          </div>
        </div>
      </section>

      <section className="merch-filter-bar" aria-label="Official merch filters">
        <input className="input" placeholder="Search merch, SKU, category, or drop name" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="select" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
        <select className="select" value={availability} onChange={(event) => setAvailability(event.target.value)}>
          <option value="all">All availability</option>
          <option value="available">In stock</option>
          <option value="sold-out">Sold out</option>
        </select>
        <select className="select" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="featured">Featured first</option>
          <option value="newest">Newest first</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="stock">Most stock</option>
        </select>
      </section>

      {filtered.length ? (
        <div className="card-grid grid-3">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <section className="card">
          <div className="empty-state">No official merch matches the current filters.</div>
          <p className="helper">Try clearing the search, switching categories, or checking back when the next Resurgence drop goes live.</p>
        </section>
      )}
    </>
  );
}
