'use client';

import Link from 'next/link';
import { Fragment, startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { FeedPost } from '@/lib/feed/types';
import { addProductToCart, CART_UPDATED_EVENT, getCartItemCount, readCart } from '@/lib/shop/cart-storage';

type Props = {
  initialItems: FeedPost[];
  initialCursor?: string | null;
  source: 'content-post' | 'gallery-fallback';
  surface?: 'home' | 'feed';
};

const FEED_PAGE_SIZE = 8;
const MEDIA_PREFETCH_DISTANCE = 1;
const DISCOVERY_CLUSTER_INTERVAL = 3;

type PendingFeedAction = 'like' | 'save' | 'follow' | 'comment';

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

export function CreatorCommerceFeed({ initialItems, initialCursor = null, source, surface = 'feed' }: Props) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadAbortRef = useRef<AbortController | null>(null);

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

  useEffect(() => {
    return () => loadAbortRef.current?.abort();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !nextCursor || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: '480px 0px 480px 0px', threshold: 0.01 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, isLoadingMore]);

  const trendingHashtags = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();

    items.forEach((item) => {
      item.hashtags.forEach((tag) => {
        const key = tag.normalizedName || tag.label.toLowerCase();
        const existing = counts.get(key);
        counts.set(key, {
          label: tag.label.startsWith('#') ? tag.label : `#${tag.label}`,
          count: (existing?.count || 0) + 1,
        });
      });
    });

    return Array.from(counts.values())
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
      .slice(0, 8);
  }, [items]);

  const creatorLanes = useMemo(() => {
    const creators = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        imageUrl: string | null;
        roleLabel: string;
        postCount: number;
        totalViews: number;
      }
    >();

    items.forEach((item) => {
      if (!item.creator) return;
      const existing = creators.get(item.creator.id);
      creators.set(item.creator.id, {
        id: item.creator.id,
        name: item.creator.name,
        slug: item.creator.slug,
        imageUrl: item.creator.imageUrl,
        roleLabel: item.creator.roleLabel,
        postCount: (existing?.postCount || 0) + 1,
        totalViews: (existing?.totalViews || 0) + item.metrics.views,
      });
    });

    return Array.from(creators.values())
      .sort((left, right) => right.totalViews - left.totalViews || right.postCount - left.postCount)
      .slice(0, 6);
  }, [items]);

  const merchHighlights = useMemo(() => {
    const products = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string | null;
        imageUrl: string | null;
        price: number | null;
        stock: number | null;
        appearances: number;
      }
    >();

    items.forEach((item) => {
      item.productTags.forEach((product) => {
        if (!product.id) return;
        const existing = products.get(product.id);
        products.set(product.id, {
          id: product.id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.imageUrl,
          price: product.price,
          stock: product.stock,
          appearances: (existing?.appearances || 0) + 1,
        });
      });
    });

    return Array.from(products.values())
      .sort((left, right) => right.appearances - left.appearances)
      .slice(0, 6);
  }, [items]);

  const sponsorMoments = useMemo(
    () => items.flatMap((item) => item.sponsorPlacements.map((placement) => ({ ...placement, postId: item.id }))).slice(0, 4),
    [items],
  );

  async function loadMore() {
    if (!nextCursor || isLoadingMore) return;
    loadAbortRef.current?.abort();
    const controller = new AbortController();
    loadAbortRef.current = controller;
    setIsLoadingMore(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/feed?cursor=${encodeURIComponent(nextCursor)}&limit=${FEED_PAGE_SIZE}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.items) {
        const message = data?.error || 'Unable to load more feed posts.';
        setLoadError(message);
        setNotice(message);
        return;
      }

      startTransition(() => {
        setItems((current) => [...current, ...data.items]);
        setNextCursor(data.nextCursor || null);
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      const message = 'Feed connection interrupted. Please try again.';
      setLoadError(message);
      setNotice(message);
    } finally {
      if (loadAbortRef.current === controller) {
        loadAbortRef.current = null;
        setIsLoadingMore(false);
      }
    }
  }

  if (!items.length) {
    return (
      <section className={`creator-commerce-feed-shell creator-commerce-feed-shell-${surface}`} id="feed">
        <div className="container">
          <div className="feed-empty-state">
            <div className="section-kicker">Creator Commerce Feed</div>
            <h2>Feed content is warming up.</h2>
            <p>Add published creator posts or active gallery events to populate the vertical feed. The experience is ready for discovery rails, merch overlays, and creator-first storytelling as soon as content lands.</p>
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
    <section className={`creator-commerce-feed-shell creator-commerce-feed-shell-${surface}`} id="feed">
      <div className="creator-commerce-launchpad">
        <div className="creator-commerce-launchpad-copy">
          <div className="section-kicker">{surface === 'home' ? 'Live Creator Commerce' : 'Discover Feed'}</div>
          <h2>{surface === 'home' ? 'The feed is now the front door to creators, merch, and sponsor moments.' : 'A premium vertical feed built for creator retention and social commerce.'}</h2>
          <p>
            Swipe through creator highlights, tagged merch, sponsor placements, and topic-led discovery without leaving the Resurgence platform flow.
          </p>
          <div className="feed-pill-stack">
            <Link href="/feed">For You</Link>
            <Link href="/creators">Creator Channels</Link>
            <Link href="/shop">Shop Drops</Link>
            <Link href="/member">Member Hub</Link>
          </div>
        </div>

        <div className="creator-commerce-launchpad-stats">
          <div>
            <strong>{items.length}</strong>
            <span>posts loaded</span>
          </div>
          <div>
            <strong>{creatorLanes.length}</strong>
            <span>creator lanes</span>
          </div>
          <div>
            <strong>{merchHighlights.length}</strong>
            <span>shop-linked drops</span>
          </div>
          <div>
            <strong>{sponsorMoments.length}</strong>
            <span>sponsor moments</span>
          </div>
        </div>
      </div>

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

          <div className="feed-rail-card subtle">
            <div className="section-kicker">Trending Topics</div>
            <div className="feed-topic-stack">
              {trendingHashtags.length ? (
                trendingHashtags.map((tag) => (
                  <button key={tag.label} type="button" onClick={() => setNotice(`${tag.label} is trending across the current feed.`)}>
                    <strong>{tag.label}</strong>
                    <span>{tag.count} post{tag.count === 1 ? '' : 's'}</span>
                  </button>
                ))
              ) : (
                <span className="helper">Topic chips appear as creators add hashtags.</span>
              )}
            </div>
          </div>
        </aside>

        <div className="feed-center-column">
          {items.map((post, index) => (
            <Fragment key={post.id}>
              <FeedCard
                active={index === activeIndex}
                index={index}
                post={post}
                refCallback={(node) => {
                  cardRefs.current[index] = node;
                }}
                setNotice={setNotice}
                shouldLoadMedia={Math.abs(index - activeIndex) <= MEDIA_PREFETCH_DISTANCE}
              />

              {(index + 1) % DISCOVERY_CLUSTER_INTERVAL === 0 ? (
                <FeedDiscoveryCluster
                  clusterIndex={Math.floor(index / DISCOVERY_CLUSTER_INTERVAL)}
                  creatorLanes={creatorLanes}
                  merchHighlights={merchHighlights}
                  sponsorMoments={sponsorMoments}
                  trendingHashtags={trendingHashtags}
                />
              ) : null}
            </Fragment>
          ))}

          {isLoadingMore ? <FeedSkeletonStack /> : null}

          {loadError ? (
            <div className="feed-load-status" role="status">
              <span>{loadError}</span>
              <button type="button" onClick={loadMore} disabled={isLoadingMore}>Retry</button>
            </div>
          ) : null}

          {nextCursor ? (
            <button className="feed-load-more" type="button" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Loading more...' : 'Load more creator posts'}
            </button>
          ) : null}

          <div className="feed-load-sentinel" ref={sentinelRef} aria-hidden="true" />
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

          <div className="feed-rail-card subtle">
            <div className="section-kicker">Creator Channels</div>
            <div className="feed-lane-stack">
              {creatorLanes.length ? (
                creatorLanes.slice(0, 4).map((creator) => (
                  <Link href={`/creators/${creator.slug}`} key={creator.id}>
                    <img src={creator.imageUrl || '/assets/resurgence-logo.jpg'} alt={creator.name} />
                    <div>
                      <strong>{creator.name}</strong>
                      <span>{creator.roleLabel} | {compactNumber(creator.totalViews)} views</span>
                    </div>
                  </Link>
                ))
              ) : (
                <span className="helper">Creator lanes will appear here when creator posts are active.</span>
              )}
            </div>
          </div>

          <div className="feed-rail-card subtle">
            <div className="section-kicker">Shoppable Highlights</div>
            <div className="feed-merch-stack">
              {merchHighlights.length ? (
                merchHighlights.slice(0, 3).map((product) => (
                  <Link href={product.slug ? `/shop/product/${product.slug}` : '/shop'} key={product.id}>
                    <strong>{product.name}</strong>
                    <span>
                      {product.price ? formatPeso(product.price) : 'View merch'}
                      {product.stock !== null && product.stock !== undefined ? ` | ${product.stock > 0 ? `${product.stock} left` : 'Sold out'}` : ''}
                    </span>
                  </Link>
                ))
              ) : (
                <span className="helper">Tagged merch appears here as creators attach products to posts.</span>
              )}
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
  shouldLoadMedia,
}: {
  active: boolean;
  post: FeedPost;
  refCallback: (node: HTMLElement | null) => void;
  setNotice: (notice: string | null) => void;
  index: number;
  shouldLoadMedia: boolean;
}) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [liked, setLiked] = useState(Boolean(post.viewerState?.liked));
  const [saved, setSaved] = useState(Boolean(post.viewerState?.saved));
  const [following, setFollowing] = useState(Boolean(post.viewerState?.followingCreator));
  const [pendingAction, setPendingAction] = useState<PendingFeedAction | null>(null);
  const [metrics, setMetrics] = useState(post.metrics);
  const media = post.mediaAssets[mediaIndex] || post.mediaAssets[0];
  const hashtags = useMemo(() => post.hashtags.slice(0, 6), [post.hashtags]);
  const primarySponsor = post.sponsorPlacements[0];
  const isActionablePost = post.source === 'content-post';

  async function runAction(
    endpoint: string,
    label: string,
    onSuccess: (data: any) => void,
    options: {
      action: PendingFeedAction;
      optimistic?: () => void;
      rollback?: () => void;
    },
  ) {
    if (!isActionablePost) {
      setNotice('Interactive actions activate on published creator-commerce posts.');
      return;
    }

    if (pendingAction) return;

    options.optimistic?.();
    setPendingAction(options.action);

    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        options.rollback?.();
        setNotice(response.status === 401 ? `Please log in to ${label}.` : data?.error || `Unable to ${label}.`);
        return;
      }
      onSuccess(data);
    } catch {
      options.rollback?.();
      setNotice(`Network issue while trying to ${label}.`);
    } finally {
      setPendingAction(null);
    }
  }

  async function postComment() {
    if (!isActionablePost) {
      setNotice('Comments activate on published creator-commerce posts.');
      return;
    }

    const body = window.prompt('Add a comment');
    if (!body) return;

    setPendingAction('comment');
    try {
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
    } catch {
      setNotice('Network issue while trying to comment.');
    } finally {
      setPendingAction(null);
    }
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

  async function sharePost() {
    const shareUrl = `${window.location.origin}/feed#post-${post.id}`;
    const shareText = `${post.caption} | RESURGENCE`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'RESURGENCE Feed',
          text: shareText,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        throw new Error('share-unavailable');
      }

      setNotice('Post link ready to share.');
    } catch {
      setNotice('Sharing is not available on this device right now.');
    }
  }

  return (
    <article className={`feed-story-card ${active ? 'is-active' : ''}`} data-index={index} id={`post-${post.id}`} ref={refCallback}>
      <div className="feed-phone-frame">
        <div className="feed-media-stage">
          {media ? <FeedMedia active={active} caption={post.caption} media={media} shouldLoad={shouldLoadMedia} /> : <div className="feed-media-missing">No media available</div>}
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
              <div className="feed-creator-name-row">
                <Link className="feed-creator-name" href={post.creator ? `/creators/${post.creator.slug}` : '/creators'}>
                  {post.creator?.name || post.author?.displayName || 'Resurgence'}
                </Link>
                <span className={`status-chip ${post.isFeatured ? 'tone-success' : 'tone-info'}`}>
                  {post.isFeatured ? 'Featured lane' : 'Creator lane'}
                </span>
              </div>
              <div className="feed-creator-role">{post.creator?.roleLabel || 'Creator Commerce'}</div>
            </div>
            {post.creator ? (
              <button
                aria-busy={pendingAction === 'follow'}
                aria-pressed={following}
                className="feed-follow-button"
                disabled={pendingAction !== null}
                type="button"
                onClick={() => {
                  const previousFollowing = following;
                  const nextFollowing = !following;
                  runAction(
                    `/api/feed/creators/${post.creator?.id}/follow`,
                    'follow creators',
                    (data) => setFollowing(Boolean(data.following)),
                    {
                      action: 'follow',
                      optimistic: () => setFollowing(nextFollowing),
                      rollback: () => setFollowing(previousFollowing),
                    },
                  );
                }}
              >
                {pendingAction === 'follow' ? 'Saving' : following ? 'Following' : 'Follow'}
              </button>
            ) : null}
          </div>

          <div className="feed-creator-stats">
            <span>{compactNumber(post.metrics.views)} views</span>
            <span>{compactNumber(post.metrics.likes)} likes</span>
            <span>{post.productTags.length ? `${post.productTags.length} merch tag${post.productTags.length === 1 ? '' : 's'}` : 'Story-first post'}</span>
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
                    <img src={product.imageUrl || '/assets/resurgence-poster.jpg'} alt={product.name} loading="lazy" decoding="async" />
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
          aria-busy={pendingAction === 'like'}
          aria-pressed={liked}
          className={liked ? 'active' : undefined}
          disabled={pendingAction !== null}
          type="button"
          onClick={() => {
            const previousLiked = liked;
            const previousLikes = metrics.likes;
            const nextLiked = !liked;
            runAction(
              `/api/feed/${post.id}/like`,
              'like posts',
              (data) => {
                setLiked(Boolean(data.liked));
                setMetrics((current) => ({ ...current, likes: data.likeCount ?? current.likes }));
              },
              {
                action: 'like',
                optimistic: () => {
                  setLiked(nextLiked);
                  setMetrics((current) => ({ ...current, likes: Math.max(0, current.likes + (nextLiked ? 1 : -1)) }));
                },
                rollback: () => {
                  setLiked(previousLiked);
                  setMetrics((current) => ({ ...current, likes: previousLikes }));
                },
              },
            );
          }}
        >
          <strong>{pendingAction === 'like' ? 'Saving' : liked ? 'Liked' : 'Like'}</strong>
          <span>{compactNumber(metrics.likes)}</span>
        </button>
        <button aria-busy={pendingAction === 'comment'} disabled={pendingAction !== null} type="button" onClick={postComment}>
          <strong>{pendingAction === 'comment' ? 'Posting' : 'Comment'}</strong>
          <span>{compactNumber(metrics.comments)}</span>
        </button>
        <button
          aria-busy={pendingAction === 'save'}
          aria-pressed={saved}
          className={saved ? 'active' : undefined}
          disabled={pendingAction !== null}
          type="button"
          onClick={() => {
            const previousSaved = saved;
            const previousSaves = metrics.saves;
            const nextSaved = !saved;
            runAction(
              `/api/feed/${post.id}/save`,
              'save posts',
              (data) => {
                setSaved(Boolean(data.saved));
                setMetrics((current) => ({ ...current, saves: data.saveCount ?? current.saves }));
              },
              {
                action: 'save',
                optimistic: () => {
                  setSaved(nextSaved);
                  setMetrics((current) => ({ ...current, saves: Math.max(0, current.saves + (nextSaved ? 1 : -1)) }));
                },
                rollback: () => {
                  setSaved(previousSaved);
                  setMetrics((current) => ({ ...current, saves: previousSaves }));
                },
              },
            );
          }}
        >
          <strong>{pendingAction === 'save' ? 'Saving' : saved ? 'Saved' : 'Save'}</strong>
          <span>{compactNumber(metrics.saves)}</span>
        </button>
        <button type="button" onClick={sharePost}>
          <strong>Share</strong>
          <span>{compactNumber(metrics.shares)}</span>
        </button>
        <Link href={post.creator ? `/creators/${post.creator.slug}` : '/creators'}>
          <strong>Profile</strong>
          <span>Open</span>
        </Link>
      </div>
    </article>
  );
}

function FeedDiscoveryCluster({
  clusterIndex,
  creatorLanes,
  merchHighlights,
  sponsorMoments,
  trendingHashtags,
}: {
  clusterIndex: number;
  creatorLanes: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    roleLabel: string;
    postCount: number;
    totalViews: number;
  }>;
  merchHighlights: Array<{
    id: string;
    name: string;
    slug: string | null;
    imageUrl: string | null;
    price: number | null;
    stock: number | null;
    appearances: number;
  }>;
  sponsorMoments: Array<{
    id: string;
    title: string;
    sponsorName: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    placementType: string;
    postId: string;
  }>;
  trendingHashtags: Array<{
    label: string;
    count: number;
  }>;
}) {
  const creatorOffset = (clusterIndex * 2) % Math.max(creatorLanes.length, 1);
  const merchOffset = clusterIndex % Math.max(merchHighlights.length, 1);
  const sponsorOffset = clusterIndex % Math.max(sponsorMoments.length, 1);
  const tagOffset = (clusterIndex * 3) % Math.max(trendingHashtags.length, 1);

  return (
    <section className="feed-discovery-cluster card">
      <div className="feed-discovery-header">
        <div>
          <div className="section-kicker">Suggested Discovery</div>
          <h3>Keep moving between creator energy, merch, and sponsor moments.</h3>
        </div>
        <Link className="button-link btn-secondary" href="/member">Open member hub</Link>
      </div>

      <div className="card-grid grid-3">
        <div className="panel">
          <div className="section-kicker">Creators to Watch</div>
          <div className="feed-lane-stack">
            {creatorLanes.length ? (
              creatorLanes.slice(creatorOffset, creatorOffset + 2).map((creator) => (
                <Link href={`/creators/${creator.slug}`} key={creator.id}>
                  <img src={creator.imageUrl || '/assets/resurgence-logo.jpg'} alt={creator.name} />
                  <div>
                    <strong>{creator.name}</strong>
                    <span>{creator.roleLabel} | {creator.postCount} post{creator.postCount === 1 ? '' : 's'}</span>
                  </div>
                </Link>
              ))
            ) : (
              <span className="helper">Creator recommendations appear as feed posts grow.</span>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="section-kicker">Shoppable Drops</div>
          <div className="feed-merch-stack">
            {merchHighlights.length ? (
              merchHighlights.slice(merchOffset, merchOffset + 2).map((product) => (
                <Link href={product.slug ? `/shop/product/${product.slug}` : '/shop'} key={product.id}>
                  <strong>{product.name}</strong>
                  <span>
                    {product.price ? formatPeso(product.price) : 'View merch'} | {product.appearances} tag{product.appearances === 1 ? '' : 's'}
                  </span>
                </Link>
              ))
            ) : (
              <span className="helper">Merch recommendations appear here when creators tag products in posts.</span>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="section-kicker">Sponsor and Topic Pulse</div>
          <div className="feed-pulse-stack">
            {sponsorMoments[sponsorOffset] ? (
              <div className="activity-item">
                <div className="activity-item-header">
                  <span className="status-chip tone-warning">Sponsor</span>
                  <span className="helper">{sponsorMoments[sponsorOffset].placementType}</span>
                </div>
                <strong>{sponsorMoments[sponsorOffset].sponsorName || sponsorMoments[sponsorOffset].title}</strong>
                <div className="helper">{sponsorMoments[sponsorOffset].title}</div>
              </div>
            ) : (
              <div className="helper">Sponsor moments will appear here once approved placements are active in feed posts.</div>
            )}

            <div className="feed-topic-inline">
              {trendingHashtags.slice(tagOffset, tagOffset + 3).map((tag) => (
                <span key={`${tag.label}-${clusterIndex}`}>{tag.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeedMedia({
  media,
  active,
  caption,
  shouldLoad,
}: {
  media: FeedPost['mediaAssets'][number];
  active: boolean;
  caption: string;
  shouldLoad: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || media.mediaType !== 'VIDEO' || !shouldLoad) return;
    video.muted = true;
    video.playsInline = true;
    if (active) video.play().catch(() => null);
    else video.pause();
  }, [active, media.mediaType, shouldLoad]);

  if (!shouldLoad) {
    return <FeedMediaPlaceholder caption={caption} media={media} />;
  }

  if (media.mediaType === 'IMAGE') {
    return <img className="feed-media" src={media.url} alt={media.altText || media.caption || caption} loading={active ? 'eager' : 'lazy'} decoding="async" />;
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
        loading={active ? 'eager' : 'lazy'}
        src={embedUrl}
        title={media.caption || caption}
      />
    );
  }

  return <a className="feed-external-media" href={media.url} target="_blank" rel="noopener noreferrer">Open media</a>;
}

function FeedMediaPlaceholder({ media, caption }: { media: FeedPost['mediaAssets'][number]; caption: string }) {
  const previewUrl = media.thumbnailUrl || (media.mediaType === 'IMAGE' ? media.url : '');
  const label = media.mediaType === 'VIDEO' ? 'Video queued' : media.mediaType === 'YOUTUBE' || media.mediaType === 'VIMEO' ? 'Embed queued' : 'Media queued';

  return (
    <div className="feed-media-placeholder" aria-label={`${label}: ${media.altText || media.caption || caption}`}>
      {previewUrl ? <img src={previewUrl} alt="" loading="lazy" decoding="async" /> : null}
      <div>
        <span>{label}</span>
        <small>Loads as this post enters view.</small>
      </div>
    </div>
  );
}

function FeedSkeletonStack() {
  return (
    <div className="feed-skeleton-stack" aria-hidden="true">
      {[0, 1].map((item) => (
        <div className="feed-story-skeleton" key={item}>
          <div />
          <span />
        </div>
      ))}
    </div>
  );
}
