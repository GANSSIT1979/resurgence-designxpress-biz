import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StickyMobileActionBar } from '@/components/sticky-mobile-action-bar';
import { prisma } from '@/lib/prisma';
import { MerchPurchasePanel } from '@/components/shop/merch-purchase-panel';
import { ProductCard } from '@/components/shop/product-card';
import { formatPeso, splitMerchOptions } from '@/lib/shop';

export const dynamic = 'force-dynamic';

function display(value?: string | null) {
  return value && value.trim() ? value : 'Not yet provided';
}

export default async function ShopProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.shopProduct.findUnique({ where: { slug }, include: { category: true } });
  if (!product || !product.isActive) notFound();

  const related = await prisma.shopProduct.findMany({
    where: {
      id: { not: product.id },
      isActive: true,
      categoryId: product.categoryId || undefined,
    },
    include: { category: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: 3,
  });
  const taggedContent = await prisma.contentPost.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      productTags: {
        some: {
          productId: product.id,
        },
      },
    },
    select: {
      id: true,
      caption: true,
      likeCount: true,
      viewCount: true,
      creatorProfile: {
        select: {
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
      mediaAssets: {
        select: {
          url: true,
          thumbnailUrl: true,
          altText: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        take: 1,
      },
      hashtags: {
        select: {
          hashtag: {
            select: {
              label: true,
            },
          },
        },
        take: 3,
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
    take: 4,
  });

  const sizes = splitMerchOptions(product.availableSizes);
  const colors = splitMerchOptions(product.availableColors);
  const purchaseProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl,
    availableSizes: product.availableSizes,
    availableColors: product.availableColors,
  };

  return (
    <main className="section merch-detail-page">
      <div className="container">
        <Link className="helper" href="/shop">Back to Official Merch</Link>
        <div className="merch-detail-grid">
          <section className="card merch-detail-media">
            <img src={product.imageUrl || '/assets/resurgence-poster.jpg'} alt={product.name} className="shop-detail-image" />
            <div className="merch-detail-badges">
              <span className="badge">{product.badgeLabel || 'Official Drop'}</span>
              <span className={`status-pill ${product.stock > 0 ? 'status-DELIVERED' : 'status-CANCELLED'}`}>{product.stock > 0 ? 'Available' : 'Sold out'}</span>
            </div>
          </section>

          <section className="card merch-detail-summary">
            <div className="section-kicker">{product.category?.name || 'Official Resurgence Merch'}</div>
            <h1 className="section-title" style={{ fontSize: 'clamp(2.4rem, 4vw, 4.2rem)' }}>{product.name}</h1>
            <p className="section-copy">{product.description}</p>
            <div className="shop-price-row" style={{ marginTop: 18 }}>
              <strong>{formatPeso(product.price)}</strong>
              {product.compareAtPrice ? <span className="shop-price-old">{formatPeso(product.compareAtPrice)}</span> : null}
            </div>
            <div className="merch-spec-grid">
              <div><span>SKU</span><strong>{display(product.sku)}</strong></div>
              <div><span>Material</span><strong>{display(product.material)}</strong></div>
              <div><span>Fit</span><strong>{display(product.fitNotes)}</strong></div>
              <div><span>Stock</span><strong>{product.stock}</strong></div>
            </div>
            <MerchPurchasePanel product={purchaseProduct} />
          </section>
        </div>

        <div className="card-grid grid-3" style={{ marginTop: 24 }}>
          <section className="card">
            <div className="section-kicker">Available Sizes</div>
            <div className="merch-pill-row">
              {sizes.length ? sizes.map((size) => <span key={size}>{size}</span>) : <span>Not yet provided</span>}
            </div>
          </section>
          <section className="card">
            <div className="section-kicker">Available Colors</div>
            <div className="merch-pill-row">
              {colors.length ? colors.map((color) => <span key={color}>{color}</span>) : <span>Not yet provided</span>}
            </div>
          </section>
          <section className="card">
            <div className="section-kicker">Care Instructions</div>
            <p className="helper">{display(product.careInstructions)}</p>
          </section>
        </div>

        <section className="card merch-service-card" style={{ marginTop: 24 }}>
          <div>
            <div className="section-kicker">Resurgence Merch Promise</div>
            <h2>Built for fans, creators, players, and sponsor activations.</h2>
            <p className="section-copy">
              Every official item is managed through the Resurgence commerce workflow with live stock, cart checkout, admin order updates, and customer order lookup.
            </p>
          </div>
          <div className="merch-service-list">
            <div><strong>Nationwide shipping</strong><span>Philippines delivery coverage</span></div>
            <div><strong>Flexible payments</strong><span>GCash, Maya, bank, card, cash, or COD</span></div>
            <div><strong>Admin fulfillment</strong><span>Status and payment tracking inside the dashboard</span></div>
          </div>
        </section>

        {taggedContent.length ? (
          <section className="merch-content-rail" style={{ marginTop: 28 }}>
            <div className="section-kicker">Creator-linked content</div>
            <h2 className="section-title" style={{ fontSize: '2.3rem' }}>Seen in the feed</h2>
            <div className="merch-content-grid">
              {taggedContent.map((item) => {
                const media = item.mediaAssets[0];

                return (
                  <article className="merch-content-card" key={item.id}>
                    <div className="merch-content-card-media">
                      {media?.thumbnailUrl || media?.url ? (
                        <img src={media.thumbnailUrl || media.url} alt={media?.altText || item.caption} />
                      ) : (
                        <span>No media</span>
                      )}
                    </div>
                    <div className="merch-content-card-body">
                      <div className="merch-content-card-top">
                        <strong>{item.creatorProfile?.name || 'Resurgence creator'}</strong>
                        <span>{item.viewCount} views</span>
                      </div>
                      <h3>{item.caption}</h3>
                        <div className="creator-post-tags">
                        {item.hashtags.map((tag) => (
                          <span key={`${item.id}-${tag.hashtag.label}`}>{tag.hashtag.label}</span>
                        ))}
                        <span>{item.likeCount} likes</span>
                      </div>
                      <div className="btn-row">
                        <Link className="button-link btn-secondary" href={`/feed#post-${item.id}`}>Open in feed</Link>
                        {item.creatorProfile?.slug ? (
                          <Link className="button-link btn-secondary" href={`/creators/${item.creatorProfile.slug}`}>Creator profile</Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {related.length ? (
          <section style={{ marginTop: 32 }}>
            <div className="section-kicker">Related Drops</div>
            <h2 className="section-title" style={{ fontSize: '2.4rem' }}>More official merch</h2>
            <div className="card-grid grid-3" style={{ marginTop: 18 }}>
              {related.map((item) => <ProductCard key={item.id} product={JSON.parse(JSON.stringify(item))} />)}
            </div>
          </section>
        ) : null}
      </div>
      <StickyMobileActionBar
        primaryHref="/cart"
        primaryLabel="View cart"
        secondaryHref="/feed"
        secondaryLabel="Back to feed"
        note="Move from creator content to checkout without losing the merch trail."
      />
    </main>
  );
}
