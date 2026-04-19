'use client';

import Link from 'next/link';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { FeedPost } from '@/lib/feed/types';
import { addProductToCart, CART_UPDATED_EVENT, getCartItemCount, readCart } from '@/lib/shop/cart-storage';

type Props = {
  initialItems: FeedPost[];
  initialCursor?: string | null;
  source: 'content-post' | 'gallery-fallback';
};

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function formatPeso(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || '';
}

function getVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] || '';
}

function getEmbedUrl(media: FeedPost['mediaAssets'][number], active: boolean) {
  if (media.mediaType === 'YOUTUBE') {
    const id = getYouTubeId(media.url);
    if (!id) return '';
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1', controls: '1' });
    if (active) {
      params.set('autoplay', '1');
      params.set('mute', '1');
    }
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }

  if (media.mediaType === 'VIMEO') {
    const id = getVimeoId(media.url);
    if (!id) return '';
    const params = new URLSearchParams({ playsinline: '1', title: '0', byline: '0', portrait: '0' });
    if (active) {
      params.set('autoplay', '1');
      params.set('muted', '1');
    }
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }

  return '';
}

export function CreatorCommerceFeed({ initialItems, initialCursor = null, source }: Props) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (!visible) return;
        setActiveIndex(Number((visible.target as HTMLElement).dataset.index || 0));
      },
      { rootMargin: '-20% 0px -20% 0px', threshold: [0.45, 0.65, 0.82] },
    );

    cardRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    const syncCart = () => setCartCount(getCartItemCount(readCart()));
    syncCart();
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    return () => window.removeEventListener(CART_UPDATED_EVENT, syncCart);
  }, []);

  async function loadMore() {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    const response = await fetch(`/api/feed?cursor=${encodeURIComponent(nextCursor)}&limit=8`);
    const data = await response.json().catch(() => null);
    setIsLoadingMore(false);

    if (!response.ok || !data?.items) {
      setNotice(data?.error || 'Unable to load more feed posts.');
      return;
    }

    startTransition(() => {
      setItems((current) => [...current, ...data.items]);
      setNextCursor(data.nextCursor || null);
    });
  }

  if (!items.length) {
    return (
      <section className="creator-commerce-feed-shell" id="feed">
        <div className="container">
          <div className="feed-empty-state">
            <div className="section-kicker">Creator Commerce Feed</div>
            <h2>Feed content is warming up.</h2>
            <p>Add published creator posts or active gallery events to populate the vertical feed.</p>
            <div className="btn-row">
              <Link href="/creators" className="button-link">Explore Creators</Link>
              <Link href="/shop" className="button-link btn-secondary">Shop Merch</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="creator-commerce-feed-shell" id="feed">
      <div className="creator-commerce-grid">
        <aside className="feed-left-rail" aria-label="Creator commerce navigation">
          <div className="feed-rail-card">
            <div className="section-kicker">Live Feed</div>
            <h2>Creator commerce, game-day media, and sponsor energy in one scroll.</h2>
            <p>Autoplay highlights, shoppable tags, creator profiles, and promoted placements built for the Resurgence community.</p>
            <div className="feed-pill-stack">
              <Link href="/creators">Creators</Link>
              <Link href="/shop">Official Merch</Link>
              <Link href="/sponsor/apply">Sponsor Apply</Link>
            </div>
          </div>

          <div className="feed-rail-card subtle">
            <strong>{source === 'gallery-fallback' ? 'Gallery fallback active' : 'Creator posts active'}</strong>
            <p>{source === 'gallery-fallback' ? 'The feed is using existing gallery media until published feed posts exist.' : 'Published creator-commerce posts are powering this feed.'}</p>
          </div>
        </aside>

        <div className="feed-center-column">
          {items.map((post, index) => (
            <FeedCard
              active={index === activeIndex}
              index={index}
              key={post.id}
              post={post}
              refCallback={(node) => {
                cardRefs.current[index] = node;
              }}
              setNotice={setNotice}
            />
          ))}

          {nextCursor ? (
            <button className="feed-load-more" type="button" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Loading more...' : 'Load more creator posts'}
            </button>
          ) : null}
        </div>

        <aside className="feed-right-rail" aria-label="Feed context">
          <div className="feed-rail-card">
            <div className="section-kicker">Today on Resurgence</div>
            <div className="feed-mini-stat"><strong>{items.length}</strong><span>feed posts loaded</span></div>
            <div className="feed-mini-stat"><strong>{items.filter((item) => item.productTags.length).length}</strong><span>shoppable posts</span></div>
            <div className="feed-mini-stat"><strong>{items.filter((item) => item.sponsorPlacements.length).length}</strong><span>sponsor placements</span></div>
            <div className="feed-mini-stat"><strong>{cartCount}</strong><span>items in cart</span></div>
            <div className="feed-cart-actions">
              <Link href="/cart">View Cart</Link>
              <Link href="/checkout">Checkout</Link>
            </div>
          </div>

          {notice ? (
            <div className="feed-notice">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice(null)}>Dismiss</button>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function FeedCard({
  active,
  post,
  refCallback,
  setNotice,
  index,
}: {
  active: boolean;
  post: FeedPost;
  refCallback: (node: HTMLElement | null) => void;
  setNotice: (notice: string | null) => void;
  index: number;
}) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [liked, setLiked] = useState(Boolean(post.viewerState?.liked));
  const [saved, setSaved] = useState(Boolean(post.viewerState?.saved));
  const [following, setFollowing] = useState(Boolean(post.viewerState?.followingCreator));
  const [metrics, setMetrics] = useState(post.metrics);
  const media = post.mediaAssets[mediaIndex] || post.mediaAssets[0];
  const hashtags = useMemo(() => post.hashtags.slice(0, 6), [post.hashtags]);
  const primarySponsor = post.sponsorPlacements[0];
  const isActionablePost = post.source === 'content-post';

  async function runAction(endpoint: string, label: string, onSuccess: (data: any) => void) {
    if (!isActionablePost) {
      setNotice('Interactive actions activate on published creator-commerce posts.');
      return;
    }

    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setNotice(response.status === 401 ? `Please log in to ${label}.` : data?.error || `Unable to ${label}.`);
      return;
    }
    onSuccess(data);
  }

  async function postComment() {
    if (!isActionablePost) {
      setNotice('Comments activate on published creator-commerce posts.');
      return;
    }

    const body = window.prompt('Add a comment');
    if (!body) return;

    const response = await fetch(`/api/feed/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setNotice(response.status === 401 ? 'Please log in to comment.' : data?.error || 'Unable to comment.');
      return;
    }

    setMetrics((current) => ({ ...current, comments: current.comments + 1 }));
    setNotice('Comment posted.');
  }

  function addToCart(product: FeedPost['productTags'][number]) {
    const result = addProductToCart({
      productId: product.productId,
      slug: product.slug,
      name: product.name,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
    });

    if (!result.ok && result.reason === 'missing-product') {
      setNotice('This merch tag is missing product details.');
      return;
    }

    if (!result.ok && result.reason === 'sold-out') {
      setNotice('This merch item is currently sold out.');
      return;
    }

    setNotice(result.capped ? `${product.name} is already at available stock in your cart.` : `${product.name} added to cart. Checkout is ready when you are.`);
  }

  return (
    <article className={`feed-story-card ${active ? 'is-active' : ''}`} data-index={index} ref={refCallback}>
      <div className="feed-phone-frame">
        <div className="feed-media-stage">
          {media ? <FeedMedia active={active} caption={post.caption} media={media} /> : <div className="feed-media-missing">No media available</div>}
        </div>

        {post.mediaAssets.length > 1 ? (
          <div className="feed-media-tabs" aria-label="Post media">
            {post.mediaAssets.map((item, itemIndex) => (
              <button
                aria-label={`Open media ${itemIndex + 1}`}
                className={itemIndex === mediaIndex ? 'active' : undefined}
                key={item.id}
                onClick={() => setMediaIndex(itemIndex)}
                type="button"
              />
            ))}
          </div>
        ) : null}

        <div className="feed-story-overlay">
          <div className="feed-creator-row">
            <Link className="feed-avatar" href={post.creator ? `/creators/${post.creator.slug}` : '/creators'}>
              <img src={post.creator?.imageUrl || '/assets/resurgence-logo.jpg'} alt={post.creator?.name || 'Resurgence'} />
            </Link>
            <div>
              <Link className="feed-creator-name" href={post.creator ? `/creators/${post.creator.slug}` : '/creators'}>
                {post.creator?.name || post.author?.displayName || 'Resurgence'}
              </Link>
              <div className="feed-creator-role">{post.creator?.roleLabel || 'Creator Commerce'}</div>
            </div>
            {post.creator ? (
              <button
                className="feed-follow-button"
                type="button"
                onClick={() => runAction(`/api/feed/creators/${post.creator?.id}/follow`, 'follow creators', (data) => setFollowing(Boolean(data.following)))}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            ) : null}
          </div>

          <p className="feed-caption">{post.caption}</p>
          {post.summary ? <p className="feed-summary">{post.summary}</p> : null}
          <div className="feed-hashtags">{hashtags.map((hashtag) => <span key={hashtag.id}>{hashtag.label}</span>)}</div>

          {primarySponsor ? (
            <div className="feed-sponsored-strip">
              <span>Promoted</span>
              <strong>{primarySponsor.sponsorName || primarySponsor.title}</strong>
              {primarySponsor.ctaHref ? <a href={primarySponsor.ctaHref} target="_blank" rel="noopener noreferrer">{primarySponsor.ctaLabel || 'Open'}</a> : null}
            </div>
          ) : null}

          {post.productTags.length ? (
            <div className="feed-product-shelf">
              {post.productTags.slice(0, 3).map((product) => {
                const isSoldOut = product.stock !== null && product.stock !== undefined && product.stock <= 0;

                return (
                  <div className="feed-product-chip" key={product.id}>
                    <img src={product.imageUrl || '/assets/resurgence-poster.jpg'} alt={product.name} />
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.price ? formatPeso(product.price) : 'View merch'} {product.stock !== null && product.stock !== undefined ? `- ${isSoldOut ? 'Sold out' : `${product.stock} left`}` : ''}</span>
                    </div>
                    <div className="feed-product-actions">
                      {product.slug ? <Link href={`/shop/product/${product.slug}`}>{product.ctaLabel || 'View'}</Link> : null}
                      <button type="button" onClick={() => addToCart(product)} disabled={isSoldOut}>{isSoldOut ? 'Sold Out' : 'Add'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="feed-action-rail">
        <button
          className={liked ? 'active' : undefined}
          type="button"
          onClick={() => runAction(`/api/feed/${post.id}/like`, 'like posts', (data) => {
            setLiked(Boolean(data.liked));
            setMetrics((current) => ({ ...current, likes: data.likeCount ?? current.likes }));
          })}
        >
          <strong>{liked ? 'Liked' : 'Like'}</strong>
          <span>{compactNumber(metrics.likes)}</span>
        </button>
        <button type="button" onClick={postComment}>
          <strong>Comment</strong>
          <span>{compactNumber(metrics.comments)}</span>
        </button>
        <button
          className={saved ? 'active' : undefined}
          type="button"
          onClick={() => runAction(`/api/feed/${post.id}/save`, 'save posts', (data) => {
            setSaved(Boolean(data.saved));
            setMetrics((current) => ({ ...current, saves: data.saveCount ?? current.saves }));
          })}
        >
          <strong>{saved ? 'Saved' : 'Save'}</strong>
          <span>{compactNumber(metrics.saves)}</span>
        </button>
        <Link href={post.creator ? `/creators/${post.creator.slug}` : '/creators'}>
          <strong>Profile</strong>
          <span>Open</span>
        </Link>
      </div>
    </article>
  );
}

function FeedMedia({ media, active, caption }: { media: FeedPost['mediaAssets'][number]; active: boolean; caption: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || media.mediaType !== 'VIDEO') return;
    video.muted = true;
    video.playsInline = true;
    if (active) video.play().catch(() => null);
    else video.pause();
  }, [active, media.mediaType]);

  if (media.mediaType === 'IMAGE') {
    return <img className="feed-media" src={media.url} alt={media.altText || media.caption || caption} loading={active ? 'eager' : 'lazy'} />;
  }

  if (media.mediaType === 'VIDEO') {
    return <video className="feed-media" loop muted playsInline poster={media.thumbnailUrl || undefined} preload={active ? 'auto' : 'metadata'} ref={videoRef} src={media.url} />;
  }

  if (media.mediaType === 'YOUTUBE' || media.mediaType === 'VIMEO') {
    const embedUrl = getEmbedUrl(media, active);
    if (!embedUrl) return <a className="feed-external-media" href={media.url} target="_blank" rel="noopener noreferrer">Open media</a>;
    return (
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="feed-media feed-embed"
        src={embedUrl}
        title={media.caption || caption}
      />
    );
  }

  return <a className="feed-external-media" href={media.url} target="_blank" rel="noopener noreferrer">Open media</a>;
}
