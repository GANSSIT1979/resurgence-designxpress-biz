import Link from 'next/link';

export type TikTokDiscoveryCmsItem = {
  id: string;
  eyebrow: string;
  title: string;
  caption: string;
  creator: string;
  role: string;
  imageUrl: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  likes: string;
  comments: string;
  shares: string;
  tags: string[];
};

type DiscoveryItem = {
  id: string;
  eyebrow: string;
  title: string;
  caption: string;
  creator: string;
  role: string;
  imageUrl: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  likes: string;
  comments: string;
  shares: string;
  tags: string[];
};

const fallbackDiscoveryItems: DiscoveryItem[] = [
  {
    id: 'resurgence-main',
    eyebrow: 'FOR YOU',
    title: 'Creator commerce, sponsor activations, and basketball culture in one feed.',
    caption:
      'A mobile-first RESURGENCE experience for creators, merch drops, sponsors, basketball events, and community stories.',
    creator: 'RESURGENCE',
    role: 'Powered by DesignXpress',
    imageUrl: '/branding/resurgence-shop-mockup.png',
    primaryCtaLabel: 'Open Feed',
    primaryCtaHref: '/feed',
    secondaryCtaLabel: 'Shop Drops',
    secondaryCtaHref: '/shop',
    likes: '18.4K',
    comments: '842',
    shares: '1.9K',
    tags: ['#ResurgenceDX', '#CreatorCommerce', '#BasketballCulture'],
  },
  {
    id: 'dayo-series',
    eyebrow: 'EVENT DROP',
    title: 'DAYO Series OFW All-Star 2026',
    caption:
      'Sponsor-ready basketball activation connecting OFW communities, brand partners, creator media, and event-day visibility.',
    creator: 'AMMOS 2014 Hong Kong',
    role: 'Event Organizer',
    imageUrl: '/branding/resurgence-shop-mockup.png',
    primaryCtaLabel: 'Open Event',
    primaryCtaHref: '/events/dayo-series-ofw-all-star',
    secondaryCtaLabel: 'Apply as Sponsor',
    secondaryCtaHref: '/events/dayo-series-ofw-all-star/apply',
    likes: '12.7K',
    comments: '390',
    shares: '920',
    tags: ['#DAYOSeries', '#OFWAllStar', '#SponsorActivation'],
  },
  {
    id: 'shop-drop',
    eyebrow: 'SHOP DROP',
    title: 'Merch, uniforms, apparel, and branded team gear.',
    caption:
      'Browse official drops and route custom apparel needs into DesignXpress production workflows.',
    creator: 'DesignXpress Merch',
    role: 'Official Shop',
    imageUrl: '/branding/resurgence-shop-mockup.png',
    primaryCtaLabel: 'Open Shop',
    primaryCtaHref: '/shop',
    secondaryCtaLabel: 'Custom Inquiry',
    secondaryCtaHref: '/contact',
    likes: '7.2K',
    comments: '284',
    shares: '531',
    tags: ['#ShopDrop', '#CustomApparel', '#TeamGear'],
  },
];

export function TikTokStyleDiscoveryShell({
  brandName,
  feedCount,
  creatorLaneCount,
  shoppableFeedCount,
  sponsorMomentCount,
  trendingHashtags,
  discoveryItems = fallbackDiscoveryItems,
}: {
  brandName: string;
  feedCount: number;
  creatorLaneCount: number;
  shoppableFeedCount: number;
  sponsorMomentCount: number;
  trendingHashtags: string[];
  discoveryItems?: TikTokDiscoveryCmsItem[];
}) {
  return (
    <section className="tiktok-discovery-shell" aria-label={`${brandName} discovery feed`}>
      <div className="tiktok-discovery-header">
        <div>
          <div className="section-kicker">TikTok-style Discovery</div>
          <h1>Swipe through creators, merch, sponsors, and events.</h1>
          <p>
            A premium vertical discovery layer for RESURGENCE that keeps the existing CMS,
            shop, sponsor, creator, and media systems intact.
          </p>
        </div>

        <div className="tiktok-discovery-metrics">
          <Metric label="Feed" value={feedCount} />
          <Metric label="Creators" value={creatorLaneCount} />
          <Metric label="Shop-linked" value={shoppableFeedCount} />
          <Metric label="Sponsors" value={sponsorMomentCount} />
        </div>
      </div>

      {trendingHashtags.length ? (
        <div className="tiktok-hashtag-row">
          {trendingHashtags.map((tag) => (
            <Link href="/feed" key={tag}>
              {tag}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="tiktok-reel-frame">
        <div className="tiktok-reel-track">
          {discoveryItems.map((item) => (
            <article className="tiktok-reel-card" key={item.id}>
              <div
                className="tiktok-reel-bg"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <div className="tiktok-reel-overlay" />

              <div className="tiktok-reel-copy">
                <p>{item.eyebrow}</p>
                <h2>{item.title}</h2>
                <span>{item.caption}</span>

                <div className="tiktok-tag-row">
                  {item.tags.map((tag) => (
                    <strong key={tag}>{tag}</strong>
                  ))}
                </div>

                <div className="tiktok-creator-row">
                  <div className="tiktok-avatar">RX</div>
                  <div>
                    <b>{item.creator}</b>
                    <small>{item.role}</small>
                  </div>
                </div>

                <div className="tiktok-cta-row">
                  <Link href={item.primaryCtaHref}>{item.primaryCtaLabel}</Link>
                  <Link href={item.secondaryCtaHref}>{item.secondaryCtaLabel}</Link>
                </div>
              </div>

              <aside className="tiktok-action-rail">
                <Action label="Like" value={item.likes} />
                <Action label="Comment" value={item.comments} />
                <Action label="Share" value={item.shares} />
                <Link href={item.primaryCtaHref} className="tiktok-open-button">
                  Open
                </Link>
              </aside>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Action({ label, value }: { label: string; value: string }) {
  return (
    <div className="tiktok-action">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}