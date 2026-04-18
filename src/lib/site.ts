import { db } from "@/lib/db";

type ContentFallback = {
  title: string;
  subtitle: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

const sponsorshipStats = {
  combinedFollowers: "2.15M+",
  activePlatforms: "2",
  creatorCount: "6",
};

const creatorFallbacks = [
  {
    id: "fallback-creator-1",
    name: "Jake Anilao",
    slug: "jake-anilao",
    roleLabel: "Brand Ambassador / Coach / Influencer",
    platformFocus: "Basketball, sponsorships, creator-led campaigns",
    audience: "Sports and community audience",
    biography:
      "Jake Anilao leads creator-facing brand partnerships for RESURGENCE while building audience trust through basketball, coaching, and business visibility.",
    journeyStory:
      "Creator, coach, and sponsorship-facing brand representative inside the RESURGENCE ecosystem.",
    pointsPerGame: 19.4,
    assistsPerGame: 6.8,
    reboundsPerGame: 7.2,
    imageUrl: "/uploads/jake-image1.jpg",
  },
];

const inventoryFallbacks = [
  {
    id: "fallback-inventory-1",
    name: "Digital and Social Placement",
    description:
      "Brand visibility across creator posts, campaign assets, and basketball-led digital promotion.",
    examples: ["Creator-led posts", "Brand mention integration", "Campaign visuals"].join("\n"),
  },
  {
    id: "fallback-inventory-2",
    name: "On-Ground Event Presence",
    description:
      "Sponsor positioning through physical event placements and partner-facing basketball activations.",
    examples: ["Event banners", "Booth visibility", "Venue exposure"].join("\n"),
  },
];

const galleryFallbackEvents = [
  {
    id: "fallback-event-1",
    title: "RESURGENCE Game Day Highlights",
    slug: "fallback-resurgence-game-day-highlights",
    description:
      "A quick look at the energy, community, and sponsor visibility around RESURGENCE basketball events.",
    featured: true,
    createdAt: new Date("2026-04-10"),
    updatedAt: new Date("2026-04-10"),
    mediaItems: [
      {
        id: "fallback-media-1",
        mediaType: "IMAGE",
        url: "/uploads/jake-image2.jpg",
        thumbnailUrl: "/uploads/jake-image2.jpg",
        caption: "Game day atmosphere",
        sortOrder: 1,
      },
      {
        id: "fallback-media-2",
        mediaType: "IMAGE",
        url: "/uploads/resurgence-logo.jpg",
        thumbnailUrl: "/uploads/resurgence-logo.jpg",
        caption: "Brand and event identity",
        sortOrder: 2,
      },
    ],
  },
];

const serviceFallbacks = [
  {
    id: "fallback-service-1",
    name: "Sports League Organizer",
    category: "Operations",
    description:
      "Structured league management, scheduling, officiating, and end-to-end event operations support.",
    features: [
      "League structure and rules",
      "Scheduling and team management",
      "Venue and logistics coordination",
      "Referee and staff deployment",
      "Standings, statistics, and media coverage",
    ].join("\n"),
    priceLabel: "Custom Proposal",
    sortOrder: 1,
  },
  {
    id: "fallback-service-2",
    name: "Manufacturing & Branding",
    category: "Production",
    description:
      "Custom sports apparel, awards, event identity, and sponsor-ready branding collateral production.",
    features: [
      "Custom sports apparel for multiple sports",
      "Trophies, medals, certificates, and awards",
      "Champion rings and event identity materials",
      "Merchandise and sponsor branding collateral",
    ].join("\n"),
    priceLabel: "Quotation Based",
    sortOrder: 2,
  },
];

const contentFallbacks: Record<string, ContentFallback> = {
  "home.hero": {
    title: "RESURGENCE Powered by DesignXpress",
    subtitle: "2026 Sponsorship Proposal • Sports • Media • Brand Growth",
    body: `A sponsorship-driven sports and creator platform with ${sponsorshipStats.combinedFollowers} combined followers, ${sponsorshipStats.activePlatforms} active platforms, and ${sponsorshipStats.creatorCount} high-engagement creators.`,
    ctaLabel: "Apply as Sponsor",
    ctaHref: "/sponsor/apply",
  },
  "home.about": {
    title:
      "Built for sponsorship visibility, creator-led storytelling, and measurable activation.",
    subtitle: "Opportunity Summary",
    body:
      "We combine creator network reach, sponsor inventory, basketball-first audience trust, and commercial support into one premium brand activation system.",
    ctaLabel: "View Sponsor Packages",
    ctaHref: "/sponsors",
  },
  "about.story": {
    title: "Who We Are",
    subtitle: "Sports-business platform with creator-powered reach",
    body:
      "We create structured opportunities for sponsors, partners, creators, and communities through branded sports activation and measurable campaign delivery.",
    ctaLabel: "Contact Jake",
    ctaHref: "/contact",
  },
  "services.intro": {
    title: "Integrated sponsorship and sports services",
    subtitle: "What We Deliver",
    body:
      "From branding assets and digital integration to on-ground activation and commercial support, the platform delivers sponsor-ready solutions across the RESURGENCE ecosystem.",
    ctaLabel: "Request a proposal",
    ctaHref: "/contact",
  },
  "contact.details": {
    title: "Let's build a premium sponsorship package together.",
    subtitle: "Contact & Inquiry",
    body:
      "Use the inquiry form to request sponsor packages, creator integration, on-ground activation support, commercial proposals, or partnership discussions.",
    ctaLabel: "Open sponsor application",
    ctaHref: "/sponsor/apply",
  },
};

export async function getContentMap() {
  const entries = await db.contentSection.findMany({
    where: { active: true },
  });

  const map = new Map(entries.map((entry) => [entry.key, entry] as const));

  return Object.fromEntries(
    Object.entries(contentFallbacks).map(([key, fallback]) => {
      const current = map.get(key);
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
}

function buildSponsorCards(packages: any[]) {
  return packages.map((pkg) => ({
    id: pkg.id,
    name: pkg.title,
    tier: pkg.title,
    shortDescription: pkg.description,
    packageValue: pkg.priceRange,
    benefits: Array.isArray(pkg.benefits)
      ? pkg.benefits.join("\n")
      : typeof pkg.benefits === "string"
        ? pkg.benefits
        : "",
  }));
}

function buildPartnerCards(partners: any[]) {
  return partners.map((partner) => ({
    id: partner.id,
    name: partner.name,
    category: "Partner",
    shortDescription: partner.description,
    services: partner.description,
    website: partner.website ?? "",
    logo: partner.logo ?? "",
  }));
}

function buildCreatorCards(creators: any[]) {
  return creators.map((creator) => ({
    id: creator.id,
    name: creator.fullName,
    slug: creator.slug,
    roleLabel: "Creator / Athlete / Influencer",
    platformFocus: "Basketball, sponsorships, digital visibility",
    audience: "Sports and community audience",
    biography: creator.biography,
    journeyStory: creator.journeyStory,
    pointsPerGame: creator.pointsPerGame,
    assistsPerGame: creator.assistsPerGame,
    reboundsPerGame: creator.reboundsPerGame,
    imageUrl: creator.image || "/uploads/resurgence-logo.jpg",
  }));
}

function buildInventoryCategories(items: any[]) {
  const grouped = new Map<string, any[]>();

  for (const item of items) {
    const key = item.category || "General";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  return Array.from(grouped.entries()).map(([name, group], index) => ({
    id: `inventory-${index + 1}`,
    name,
    description: `${name} sponsor inventory and activation items.`,
    examples: group.map((item) => item.title).join("\n"),
  }));
}

export async function getHomeData() {
  const [
    contentMap,
    sponsorPackages,
    partnersRaw,
    inquiryCount,
    creatorsRaw,
    inventoryItemsRaw,
    galleryEvents,
  ] = await Promise.all([
    getContentMap(),
    db.sponsorPackage.findMany({
      where: { status: "ACTIVE" as any },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    db.partner.findMany({
      where: { status: "ACTIVE" as any },
      orderBy: [{ createdAt: "desc" }],
    }),
    db.inquiry.count(),
    db.creatorProfile.findMany({
      orderBy: [{ featured: "desc" }, { fullName: "asc" }],
    }),
    db.sponsorInventoryItem.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    }),
    getGalleryEvents(),
  ]);

  const creators = creatorsRaw.length
    ? buildCreatorCards(creatorsRaw)
    : creatorFallbacks;

  const inventoryCategories = inventoryItemsRaw.length
    ? buildInventoryCategories(inventoryItemsRaw)
    : inventoryFallbacks;

  return {
    contentMap,
    sponsors: sponsorPackages.length ? buildSponsorCards(sponsorPackages) : [],
    partners: partnersRaw.length ? buildPartnerCards(partnersRaw) : [],
    packageTemplates: sponsorPackages,
    galleryEvents,
    creators,
    inventoryCategories,
    stats: [
      { label: "Combined Followers", value: sponsorshipStats.combinedFollowers },
      { label: "Active Platforms", value: sponsorshipStats.activePlatforms },
      { label: "High-Engagement Creators", value: String(creators.length) },
      { label: "Captured Inquiries", value: String(inquiryCount).padStart(2, "0") },
    ],
  };
}

export async function getGalleryEvents() {
  const events = await db.mediaEvent.findMany({
    include: {
      media: {
        orderBy: [{ createdAt: "asc" }],
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const normalized = events.map((event) => ({
    ...event,
    mediaItems: event.media.map((item, index) => ({
      id: item.id,
      mediaType: "IMAGE",
      url: item.image,
      thumbnailUrl: item.image,
      caption: item.caption || item.title || "",
      sortOrder: index + 1,
    })),
  }));

  return normalized.length ? normalized : galleryFallbackEvents;
}

export async function getCreatorBySlug(slug: string) {
  return db.creatorProfile.findUnique({
    where: { slug },
  });
}



function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const shopProductFallbacks = [
  {
    id: "shop-fallback-1",
    title: "Custom Team Jersey Package",
    name: "Custom Team Jersey Package",
    slug: "custom-team-jersey-package",
    description:
      "Premium custom jersey production for teams, events, and sponsor-ready sports branding.",
    shortDescription:
      "Premium custom jersey production for teams, events, and sponsor-ready sports branding.",
    image: "/uploads/jake-image3.jpg",
    imageUrl: "/uploads/jake-image3.jpg",
    priceLabel: "Custom Quotation",
    priceValue: "Custom Quotation",
    category: "Custom Apparel",
    badge: "Featured",
    href: "/services",
  },
  {
    id: "shop-fallback-2",
    title: "Branded Merchandise Support",
    name: "Branded Merchandise Support",
    slug: "branded-merchandise-support",
    description:
      "Sponsor-facing branded merchandise, event support assets, and commercial product packages.",
    shortDescription:
      "Sponsor-facing branded merchandise, event support assets, and commercial product packages.",
    image: "/uploads/resurgence-logo.jpg",
    imageUrl: "/uploads/resurgence-logo.jpg",
    priceLabel: "Proposal Based",
    priceValue: "Proposal Based",
    category: "Merchandise",
    badge: "Available",
    href: "/contact",
  },
];

export async function getFeaturedShopProducts(limit = 4) {
  const safeLimit = Math.max(1, Number(limit) || 4);

  const featuredServices = await db.productService.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: safeLimit,
  });

  if (featuredServices.length) {
    return featuredServices.map((item) => ({
      id: item.id,
      title: item.title,
      name: item.title,
      slug: item.slug,
      description: item.description,
      shortDescription: item.description,
      image: item.image || "/uploads/resurgence-logo.jpg",
      imageUrl: item.image || "/uploads/resurgence-logo.jpg",
      priceLabel: item.priceLabel || "Custom Proposal",
      priceValue: item.priceLabel || "Custom Proposal",
      category: item.featured ? "Featured Service" : "Service",
      badge: item.featured ? "Featured" : "Available",
      href: `/services#${item.slug}`,
    }));
  }

  const inventoryItems = await db.sponsorInventoryItem.findMany({
    where: { active: true },
    orderBy: [{ createdAt: "desc" }],
    take: safeLimit,
  });

  if (inventoryItems.length) {
    return inventoryItems.map((item) => ({
      id: item.id,
      title: item.title,
      name: item.title,
      slug: slugify(item.title),
      description: item.description,
      shortDescription: item.description,
      image: item.image || "/uploads/resurgence-logo.jpg",
      imageUrl: item.image || "/uploads/resurgence-logo.jpg",
      priceLabel: `PHP ${String(item.value)}`,
      priceValue: `PHP ${String(item.value)}`,
      category: item.category,
      badge: "Inventory",
      href: "/sponsors",
    }));
  }

  return shopProductFallbacks.slice(0, safeLimit);
}

export async function getProductServices() {
  const services = await db.productService.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });

  return services.length
    ? services.map((item) => ({
        id: item.id,
        name: item.title,
        category: item.featured ? "Featured Service" : "Service",
        description: item.description,
        features: item.description,
        priceLabel: item.priceLabel || "Custom Proposal",
        sortOrder: 0,
      }))
    : serviceFallbacks;
}
