import { prisma } from '@/lib/prisma';
import {
  creatorNetwork as creatorFallbacks,
  sponsorInventoryCategories as inventoryFallbacks,
  sponsorshipStats,
} from '@/lib/resurgence';
import { serializeCreatorProfile, serializePublicCreatorProfile } from '@/lib/creators';

type ContentFallback = {
  title: string;
  subtitle: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};


const galleryFallbackEvents = [
  {
    id: 'fallback-event-1',
    title: 'RESURGENCE Game Day Highlights',
    description: 'A quick look at the energy, community, and sponsor visibility around RESURGENCE basketball events.',
    eventDate: new Date('2026-04-10'),
    creatorId: null,
    sortOrder: 1,
    isActive: true,
    mediaItems: [
      { id: 'fallback-media-1', mediaType: 'IMAGE', url: '/assets/resurgence-poster.jpg', thumbnailUrl: '', caption: 'Game day atmosphere', sortOrder: 1 },
      { id: 'fallback-media-2', mediaType: 'IMAGE', url: '/assets/resurgence-logo.jpg', thumbnailUrl: '', caption: 'Brand and event identity', sortOrder: 2 },
    ],
  },
];


const serviceFallbacks = [
  {
    name: 'Sports League Organizer',
    category: 'Operations',
    description: 'Structured league management, scheduling, officiating, and end-to-end event operations support.',
    features: [
      'League structure and rules',
      'Scheduling and team management',
      'Venue and logistics coordination',
      'Referee and staff deployment',
      'Standings, statistics, and media coverage',
    ].join('\n'),
    priceLabel: 'Custom Proposal',
    sortOrder: 1,
  },
  {
    name: 'Coaches & Officiating Accreditation Program',
    category: 'Training',
    description: 'Certification-oriented training support for coaches and officials from foundational to advanced programs.',
    features: [
      'Training modules for theory and application',
      'Certification pathways from entry to advanced level',
      'Continuing professional development support',
      'Ethics, integrity, and safety emphasis',
    ].join('\n'),
    priceLabel: 'Custom Proposal',
    sortOrder: 2,
  },
  {
    name: 'Sports Coaching Clinic',
    category: 'Training',
    description: 'Performance-focused coaching sessions combining tactics, conditioning, sports science, and recovery support.',
    features: [
      'Tactical knowledge and game strategy',
      'Strength, agility, and conditioning',
      'Mental coaching and resilience',
      'Sports science, nutrition, and recovery',
    ].join('\n'),
    priceLabel: 'Custom Proposal',
    sortOrder: 3,
  },
  {
    name: 'Manufacturing & Branding',
    category: 'Production',
    description: 'Custom sports apparel, awards, event identity, and sponsor-ready branding collateral production.',
    features: [
      'Custom sports apparel for multiple sports',
      'Trophies, medals, certificates, and awards',
      'Champion rings and event identity materials',
      'Merchandise and sponsor branding collateral',
    ].join('\n'),
    priceLabel: 'Quotation Based',
    sortOrder: 4,
  },
];

const contentFallbacks: Record<string, ContentFallback> = {
  'home.hero': {
    title: 'Resurgence Powered by DesignXpress',
    subtitle: '2026 Sponsorship Proposal • Sports • Media • Brand Growth',
    body: `A sponsorship-driven sports and creator platform with ${sponsorshipStats.combinedFollowers} combined followers, ${sponsorshipStats.activePlatforms} active platforms, and ${sponsorshipStats.creatorCount} high-engagement creators.`,
    ctaLabel: 'Apply as Sponsor',
    ctaHref: '/sponsor/apply',
  },
  'home.about': {
    title: 'Built for sponsorship visibility, creator-led storytelling, and measurable activation.',
    subtitle: 'Opportunity Summary',
    body: 'We combine creator network reach, sponsor inventory, basketball-first audience trust, and commercial support into one premium brand activation system.',
    ctaLabel: 'View Sponsor Packages',
    ctaHref: '/sponsors',
  },
  'about.story': {
    title: 'Who We Are',
    subtitle: 'Sports-business platform with creator-powered reach',
    body: 'We create structured opportunities for sponsors, partners, creators, and communities through branded sports activation and measurable campaign delivery.',
    ctaLabel: 'Contact Jake',
    ctaHref: '/contact',
  },
  'services.intro': {
    title: 'Integrated sponsorship and sports services',
    subtitle: 'What We Deliver',
    body: 'From branding assets and digital integration to on-ground activation and commercial support, the platform delivers sponsor-ready solutions across the RESURGENCE ecosystem.',
    ctaLabel: 'Request a proposal',
    ctaHref: '/contact',
  },
  'contact.details': {
    title: "Let's build a premium sponsorship package together.",
    subtitle: 'Contact & Inquiry',
    body: 'Use the inquiry form to request sponsor packages, creator integration, event support, apparel production, commercial proposals, or partnership discussions. For sponsorship and partnership conversations, contact Jake Anilao through the official Resurgence Powered by DesignXpress channels.',
    ctaLabel: 'Open sponsor application',
    ctaHref: '/sponsor/apply',
  },
};

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

function logPublicSiteFallback(scope: string, error: unknown) {
  console.error(`[site] Falling back to static ${scope}.`, error);
}

function buildFallbackContentMap() {
  return Object.fromEntries(
    Object.entries(contentFallbacks).map(([key, fallback]) => [
      key,
      {
        key,
        title: fallback.title,
        subtitle: fallback.subtitle,
        body: fallback.body,
        ctaLabel: fallback.ctaLabel,
        ctaHref: fallback.ctaHref,
      },
    ]),
  );
}

function buildFallbackCreatorRecord(item: (typeof creatorFallbacks)[number], index: number) {
  return {
    id: String(index + 1),
    userId: null,
    user: null,
    name: item.name,
    slug: item.slug,
    roleLabel: item.role,
    platformFocus: item.platformFocus,
    audience: item.audience,
    biography: item.biography,
    journeyStory: item.journeyStory,
    contactNumber: item.contactNumber,
    address: item.address,
    dateOfBirth: item.dateOfBirth,
    jobDescription: item.jobDescription,
    position: item.position,
    height: item.height,
    facebookPage: item.facebookPage,
    facebookFollowers: item.facebookFollowers,
    tiktokPage: item.tiktokPage,
    tiktokFollowers: item.tiktokFollowers,
    instagramPage: item.instagramPage,
    instagramFollowers: item.instagramFollowers,
    youtubePage: item.youtubePage,
    youtubeFollowers: item.youtubeFollowers,
    trendingVideoUrl: item.trendingVideoUrl,
    shortBio: item.shortBio,
    pointsPerGame: item.pointsPerGame,
    assistsPerGame: item.assistsPerGame,
    reboundsPerGame: item.reboundsPerGame,
    imageUrl: item.imageUrl,
    sortOrder: index + 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function buildFallbackCreators() {
  return creatorFallbacks.map((item, index) => buildFallbackCreatorRecord(item, index));
}

function buildFallbackInventoryCategories() {
  return inventoryFallbacks.map((item, index) => ({
    id: String(index + 1),
    name: item.name,
    description: item.description,
    examples: item.examples.join('\n'),
  }));
}

function buildFallbackStats(inquiryCount = 0) {
  return [
    { label: 'Combined Followers', value: sponsorshipStats.combinedFollowers },
    { label: 'Active Platforms', value: sponsorshipStats.activePlatforms },
    { label: 'High-Engagement Creators', value: sponsorshipStats.creatorCount },
    { label: 'Captured Inquiries', value: String(inquiryCount).padStart(2, '0') },
  ];
}

export async function getContentMap() {
  if (!hasUsableDatabaseUrl()) return buildFallbackContentMap();

  try {
    const entries = await prisma.pageContent.findMany();
    const map = new Map(entries.map((entry: any) => [entry.key, entry] as const));

    return Object.fromEntries(
      Object.entries(contentFallbacks).map(([key, fallback]) => {
        const current = map.get(key) as any;
        return [
          key,
          {
            key,
            title: current?.title ?? fallback.title,
            subtitle: current?.subtitle ?? fallback.subtitle,
            body: current?.body ?? fallback.body,
            ctaLabel: current?.ctaLabel ?? fallback.ctaLabel,
            ctaHref: current?.ctaHref ?? fallback.ctaHref,
          },
        ];
      }),
    );
  } catch (error) {
    logPublicSiteFallback('content', error);
    return buildFallbackContentMap();
  }
}

export async function getHomeData() {
  if (!hasUsableDatabaseUrl()) {
    return {
      contentMap: buildFallbackContentMap(),
      sponsors: [],
      partners: [],
      packageTemplates: [],
      galleryEvents: galleryFallbackEvents,
      creators: buildFallbackCreators(),
      inventoryCategories: buildFallbackInventoryCategories(),
      stats: buildFallbackStats(),
    };
  }

  try {
    const [contentMap, sponsors, partners, inquiryCount, creators, inventoryCategories, packageTemplates, galleryEvents] = await Promise.all([
      getContentMap(),
      prisma.sponsor.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
      prisma.partner.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
      prisma.inquiry.count(),
      prisma.creatorProfile.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
      prisma.sponsorInventoryCategory.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
      prisma.sponsorPackageTemplate.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
      getGalleryEvents(),
    ]);

    return {
      contentMap,
      sponsors,
      partners,
      packageTemplates,
      galleryEvents,
      creators: creators.length ? creators : buildFallbackCreators(),
      inventoryCategories: inventoryCategories.length ? inventoryCategories : buildFallbackInventoryCategories(),
      stats: buildFallbackStats(inquiryCount),
    };
  } catch (error) {
    logPublicSiteFallback('homepage data', error);
    return {
      contentMap: buildFallbackContentMap(),
      sponsors: [],
      partners: [],
      packageTemplates: [],
      galleryEvents: galleryFallbackEvents,
      creators: buildFallbackCreators(),
      inventoryCategories: buildFallbackInventoryCategories(),
      stats: buildFallbackStats(),
    };
  }
}

export async function getCreators({ activeOnly = true }: { activeOnly?: boolean } = {}) {
  if (!hasUsableDatabaseUrl()) {
    return buildFallbackCreators().map((item) => serializePublicCreatorProfile(item));
  }

  try {
    const creators = await prisma.creatorProfile.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: { user: true },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });

    if (creators.length) {
      return creators.map((item) => serializePublicCreatorProfile(item));
    }
  } catch (error) {
    logPublicSiteFallback('creator directory', error);
  }

  return buildFallbackCreators().map((item) => serializePublicCreatorProfile(item));
}


export async function getGalleryEvents() {
  if (!hasUsableDatabaseUrl()) return galleryFallbackEvents;

  try {
    const events = await prisma.mediaEvent.findMany({
      where: { isActive: true },
      include: {
        creator: true,
        mediaItems: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
      orderBy: [{ sortOrder: 'asc' }, { eventDate: 'desc' }, { createdAt: 'desc' }],
    });

    return events.length ? events : galleryFallbackEvents;
  } catch (error) {
    logPublicSiteFallback('gallery events', error);
    return galleryFallbackEvents;
  }
}

export async function getCreatorBySlug(slug: string) {
  if (!hasUsableDatabaseUrl()) {
    const fallback = creatorFallbacks.find((item) => item.slug === slug);
    if (!fallback) return null;
    return {
      ...buildFallbackCreatorRecord(fallback, creatorFallbacks.findIndex((item) => item.slug === slug)),
      mediaEvents: [],
    };
  }

  try {
    return await prisma.creatorProfile.findUnique({
      where: { slug },
      include: {
        user: true,
        mediaEvents: {
          where: { isActive: true },
          include: { mediaItems: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
          orderBy: [{ sortOrder: 'asc' }, { eventDate: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
  } catch (error) {
    logPublicSiteFallback(`creator profile "${slug}"`, error);
    const fallback = creatorFallbacks.find((item) => item.slug === slug);
    if (!fallback) return null;
    return {
      ...buildFallbackCreatorRecord(fallback, creatorFallbacks.findIndex((item) => item.slug === slug)),
      mediaEvents: [],
    };
  }
}


export async function getProductServices() {
  const fallbackServices = serviceFallbacks.map((item, index) => ({ id: String(index + 1), ...item, createdAt: new Date(), updatedAt: new Date(), isActive: true }));
  if (!hasUsableDatabaseUrl()) return fallbackServices;

  try {
    const services = await prisma.productService.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
    return services.length ? services : fallbackServices;
  } catch (error) {
    logPublicSiteFallback('product services', error);
    return fallbackServices;
  }
}


export async function getFeaturedShopProducts(limit = 4) {
  if (!hasUsableDatabaseUrl()) return [];

  try {
    return await prisma.shopProduct.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });
  } catch (error) {
    logPublicSiteFallback('featured merch', error);
    return [];
  }
}
