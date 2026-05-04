export type TikTokFeedItem = {
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
  stats: {
    likes: string;
    comments: string;
    shares: string;
  };
  tags: string[];
};

export const tiktokFeedItems: TikTokFeedItem[] = [
  {
    id: 'resurgence-main',
    eyebrow: 'RESURGENCE',
    title: 'One feed for creators, merch, sponsors, and basketball culture.',
    caption:
      'Discover creator stories, sponsor activations, shop drops, and community events powered by DesignXpress.',
    creator: 'RESURGENCE',
    role: 'Powered by DesignXpress',
    imageUrl: '/branding/resurgence-shop-mockup.png',
    primaryCtaLabel: 'Explore Feed',
    primaryCtaHref: '/feed',
    secondaryCtaLabel: 'Shop Drops',
    secondaryCtaHref: '/shop',
    stats: {
      likes: '18.4K',
      comments: '842',
      shares: '1.9K',
    },
    tags: ['#ResurgenceDX', '#BasketballCulture', '#CreatorCommerce'],
  },
  {
    id: 'dayo-series',
    eyebrow: 'EVENT ACTIVATION',
    title: 'DAYO Series OFW All-Star 2026',
    caption:
      'Sponsor-ready basketball activation connecting OFW communities, creators, and brand partners.',
    creator: 'AMMOS 2014 Hong Kong',
    role: 'Event Organizer',
    imageUrl: '/branding/resurgence-shop-mockup.png',
    primaryCtaLabel: 'Open Event',
    primaryCtaHref: '/events/dayo-series-ofw-all-star',
    secondaryCtaLabel: 'Apply as Sponsor',
    secondaryCtaHref: '/events/dayo-series-ofw-all-star/apply',
    stats: {
      likes: '12.7K',
      comments: '390',
      shares: '920',
    },
    tags: ['#DAYOSeries', '#OFWAllStar', '#SponsorActivation'],
  },
  {
    id: 'creator-network',
    eyebrow: 'CREATOR NETWORK',
    title: 'Creator-led commerce built for real community reach.',
    caption:
      'Feature athletes, creators, coaches, sponsors, and community storytellers in one mobile-first discovery feed.',
    creator: 'RESURGENCE Creators',
    role: 'Creator Network',
    imageUrl: '/branding/resurgence-shop-mockup.png',
    primaryCtaLabel: 'View Creators',
    primaryCtaHref: '/creators',
    secondaryCtaLabel: 'Creator Dashboard',
    secondaryCtaHref: '/creator/dashboard',
    stats: {
      likes: '9.6K',
      comments: '511',
      shares: '740',
    },
    tags: ['#CreatorNetwork', '#AffiliateCommerce', '#SportsCreators'],
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
    stats: {
      likes: '7.2K',
      comments: '284',
      shares: '531',
    },
    tags: ['#ShopDrop', '#CustomApparel', '#TeamGear'],
  },
];