import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  UserStatus,
  SubmissionStatus,
  SponsorStatus,
  PartnerStatus,
  PackageStatus,
  DeliverableStatus,
  InvoiceStatus,
  TransactionType,
  EmailQueueStatus,
} from "@prisma/client";

const db = new PrismaClient();


async function main() {
  await db.chatMessage.deleteMany();
  await db.chatConversation.deleteMany();
  await db.receipt.deleteMany();
  await db.cashierTransaction.deleteMany();
  await db.invoice.deleteMany();
  await db.notification.deleteMany();
  await db.emailQueue.deleteMany();
  await db.reportSnapshot.deleteMany();
  await db.sponsorDeliverable.deleteMany();
  await db.sponsorApplication.deleteMany();
  await db.sponsorProfile.deleteMany();
  await db.user.deleteMany();
  await db.sponsor.deleteMany();
  await db.partner.deleteMany();
  await db.sponsorInventoryItem.deleteMany();
  await db.galleryMedia.deleteMany();
  await db.mediaEvent.deleteMany();
  await db.creatorProfile.deleteMany();
  await db.productService.deleteMany();
  await db.contentSection.deleteMany();
  await db.setting.deleteMany();
  await db.sponsorPackage.deleteMany();
  await db.counter.deleteMany();
  await db.quoteItem.deleteMany();
  await db.quote.deleteMany();
  await db.productTierPrice.deleteMany();
  await db.productFlatPrice.deleteMany();
  await db.productCatalogItem.deleteMany();

  const password = await bcrypt.hash("Admin123!", 10);
  const cashierPassword = await bcrypt.hash("Cashier123!", 10);
  const sponsorPassword = await bcrypt.hash("Sponsor123!", 10);
  const staffPassword = await bcrypt.hash("Staff123!", 10);
  const partnerPassword = await bcrypt.hash("Partner123!", 10);

  const supportingSponsor = await db.sponsorPackage.create({
    data: {
      title: "Supporting Sponsor",
      priceRange: "PHP 15,000–50,000",
      description: "Entry partnership tier for foundational brand visibility across RESURGENCE assets.",
      benefits: ["Logo placement", "Basic social mention", "Event acknowledgment"],
      deliverables: ["Poster placement", "1 creator mention", "Logo integration"],
      status: PackageStatus.ACTIVE,
      featured: false,
      sortOrder: 1,
    },
  });

  const officialBrandPartner = await db.sponsorPackage.create({
    data: {
      title: "Official Brand Partner",
      priceRange: "PHP 75,000–95,000",
      description: "Balanced visibility and creator support package for active brand campaigns.",
      benefits: ["Priority logo placement", "Creator feature", "On-ground mention"],
      deliverables: ["Digital integration", "Creator content package", "Sponsor feature block"],
      status: PackageStatus.ACTIVE,
      featured: true,
      sortOrder: 2,
    },
  });

  const majorPartner = await db.sponsorPackage.create({
    data: {
      title: "Major Partner",
      priceRange: "PHP 120,000–150,000",
      description: "High-value package for premium business exposure and integrated campaign delivery.",
      benefits: ["Premium exposure", "Multi-creator activations", "Inventory inclusion"],
      deliverables: ["Headline media slot", "Premium billing position", "Expanded sponsor assets"],
      status: PackageStatus.ACTIVE,
      featured: true,
      sortOrder: 3,
    },
  });

  const eventPresenting = await db.sponsorPackage.create({
    data: {
      title: "Event Presenting",
      priceRange: "Custom Proposal",
      description: "Custom presenting-tier event proposal for lead sponsor branding.",
      benefits: ["Naming rights potential", "Top billing", "Custom activation buildout"],
      deliverables: ["Custom proposal", "Executive planning", "Lead sponsor treatment"],
      status: PackageStatus.ACTIVE,
      featured: true,
      sortOrder: 4,
    },
  });

  const northline = await db.sponsor.create({
    data: {
      name: "Northline Nutrition",
      slug: "northline-nutrition",
      description: "Official nutrition partner focused on performance support and athlete recovery.",
      website: "https://example.com/northline",
      logo: "/uploads/resurgence-logo.jpg",
      status: SponsorStatus.ACTIVE,
      packageId: officialBrandPartner.id,
    },
  });

  const partner = await db.partner.create({
    data: {
      name: "DesignXpress Premium Quality",
      slug: "designxpress-premium-quality",
      description: "Production and branding support partner for premium sports-business execution.",
      website: "https://designxpress.biz",
      logo: "/uploads/resurgence-logo.jpg",
      status: PartnerStatus.ACTIVE,
    },
  });

  await db.sponsorProfile.create({
    data: {
      sponsorId: northline.id,
      packageId: officialBrandPartner.id,
      headline: "Performance-led nutrition support for RESURGENCE athletes",
      description:
        "Northline Nutrition powers high-performance basketball routines with sponsor-aligned athlete support programs.",
      contactName: "Northline Partnerships",
      contactEmail: "partnerships@northline.example",
      logo: "/uploads/resurgence-logo.jpg",
    },
  });

  const creators = [
    {
      fullName: "Jake Anilao",
      slug: "jake-anilao",
      biography:
        "Jake Anilao is one of the public faces behind RESURGENCE Powered by DesignXpress, combining leadership, coaching, creator marketing, and brand storytelling into one sponsorship-ready profile.",
      journeyStory:
        "Jake Anilao leads creator-facing brand partnerships for RESURGENCE while also building direct audience trust as a basketball coach, business connector, and influencer/vlogger. His profile is positioned for sponsor activations, basketball campaigns, creator-led promotions, and long-term commercial collaborations.",
      pointsPerGame: 19.4,
      assistsPerGame: 6.8,
      reboundsPerGame: 7.2,
      image: "/uploads/jake-image1.jpg",
      socialLinks: {
        Facebook: "https://www.facebook.com/profile.php?id=100086690809185",
        YouTube: "https://www.youtube.com/@jakeanilao3861"
      },
      featured: true
    },
    {
      fullName: "Joshua Dollente",
      slug: "joshua-dollente",
      biography:
        "Joshua Dollente bridges entrepreneurship, player branding, and creator visibility as a RESURGENCE co-owner and basketball-focused influencer.",
      journeyStory:
        "Joshua contributes both creator energy and basketball identity to the RESURGENCE network, supporting sponsor storytelling, campaign amplification, and player-driven audience engagement.",
      pointsPerGame: 15.8,
      assistsPerGame: 4.9,
      reboundsPerGame: 4.6,
      image: "/uploads/joshua-image1.jpg",
      socialLinks: {
        Facebook: "https://www.facebook.com/joshua.dollente.399421",
        Instagram: "https://www.instagram.com/joshuadollente20"
      },
      featured: true
    },
    {
      fullName: "Gabriel Dimalanta",
      slug: "gabriel-dimalanta",
      biography:
        "Gabriel Dimalanta is part of the RESURGENCE creator-athlete core, supporting basketball storytelling, sponsorship visibility, and community-facing digital engagement.",
      journeyStory:
        "As a co-owner and player personality within RESURGENCE, Gabriel adds modern basketball culture, creator presence, and partner-facing value to campaigns and activations.",
      pointsPerGame: 16.7,
      assistsPerGame: 5.1,
      reboundsPerGame: 6.4,
      image: "/uploads/gab-image.jpg",
      socialLinks: {},
      featured: true
    },
    {
      fullName: "Angelo Deciembre",
      slug: "angelo-deciembre",
      biography:
        "Angelo Deciembre adds co-owner credibility, basketball identity, and influencer potential to the RESURGENCE creator network.",
      journeyStory:
        "Angelo’s profile is suited for sports promotions, basketball business campaigns, and audience-facing activations aligned with the RESURGENCE brand.",
      pointsPerGame: 13.8,
      assistsPerGame: 3.9,
      reboundsPerGame: 5.2,
      image: "/uploads/angelo-image1.jpg",
      socialLinks: {},
      featured: false
    },
    {
      fullName: "Marlon Villamin Facundo",
      slug: "marlon-villamin-facundo",
      biography:
        "Marlon Villamin Facundo brings point-guard identity, creator visibility, and community appeal into the RESURGENCE platform as both athlete and co-owner.",
      journeyStory:
        "Marlon strengthens the creator roster with grassroots sports energy, digital visibility, and sponsor-friendly basketball positioning for campaigns and activations.",
      pointsPerGame: 14.9,
      assistsPerGame: 4.2,
      reboundsPerGame: 5.6,
      image: "/uploads/macol-image1.jpg",
      socialLinks: {
        Facebook: "https://www.facebook.com/macol.facundo7"
      },
      featured: false
    }
  ];

  for (const creator of creators) {
    await db.creatorProfile.create({ data: creator });
  }

  const launchEvent = await db.mediaEvent.create({
    data: {
      title: "Resurgence Creator Launch",
      slug: "resurgence-creator-launch",
      description: "Launch event media and creator platform introduction.",
      featured: true,
    },
  });

  const sponsorNight = await db.mediaEvent.create({
    data: {
      title: "Sponsor Partnership Night",
      slug: "sponsor-partnership-night",
      description: "Partner and sponsor engagement visuals.",
      featured: true,
    },
  });

  await db.galleryMedia.createMany({
    data: [
      {
        title: "Coach Jake Feature Poster",
        caption: "Hero media for sponsor positioning",
        description: "Featured homepage poster media.",
        image: "/uploads/jake-image2.jpg",
        featured: true,
        eventId: launchEvent.id,
      },
      {
        title: "Jake Portrait",
        caption: "Creator hero portrait",
        description: "Creator portrait for the homepage and creator network preview.",
        image: "/uploads/jake-image1.jpg",
        featured: true,
        eventId: launchEvent.id,
      },
      {
        title: "Gab Action Feature",
        caption: "Creator campaign media",
        description: "Featured creator action media.",
        image: "/uploads/gab-image.jpg",
        featured: true,
        eventId: sponsorNight.id,
      },
      {
        title: "Klint Creator Asset",
        caption: "Campaign visual",
        description: "Sponsor-ready creator asset.",
        image: "/uploads/klint-image1.jpg",
        featured: true,
        eventId: sponsorNight.id,
      },
    ],
  });

  await db.sponsorInventoryItem.createMany({
    data: [
      {
        title: "Primary Jersey Logo Placement",
        category: "Branding Assets",
        description: "Primary chest branding across official team or creator uniforms.",
        value: "25000",
        image: "/uploads/resurgence-logo.jpg",
        packageApplicability: ["Official Brand Partner", "Major Partner", "Event Presenting"],
        active: true,
      },
      {
        title: "Social Media Integration Block",
        category: "Digital Integration",
        description: "Brand integration across scheduled sponsor content releases.",
        value: "18000",
        image: "/uploads/jake-image3.jpg",
        packageApplicability: ["Supporting Sponsor", "Official Brand Partner", "Major Partner"],
        active: true,
      },
      {
        title: "On-Ground Booth Visibility",
        category: "On-Ground Activation",
        description: "Physical event placement and activation area support.",
        value: "35000",
        image: "/uploads/jake-image2.jpg",
        packageApplicability: ["Major Partner", "Event Presenting"],
        active: true,
      },
      {
        title: "Commercial Support Video Feature",
        category: "Commercial Support",
        description: "Creator-backed commercial media content support.",
        value: "42000",
        image: "/uploads/gab-image.jpg",
        packageApplicability: ["Official Brand Partner", "Major Partner", "Event Presenting"],
        active: true,
      },
    ],
  });

  await db.contentSection.createMany({
    data: [
      {
        key: "home-hero",
        title: "RESURGENCE Powered by DesignXpress",
        subtitle: "Sports-business sponsorship engine",
        body: "Premium sports-business branding and creator-driven sponsor activations.",
        ctaLabel: "Apply as Sponsor",
        ctaHref: "/sponsor/apply",
        active: true,
      },
      {
        key: "contact-jake",
        title: "Contact Jake",
        subtitle: "Direct business coordination",
        body: "Coordinate sponsorship packages, creator integration, and campaign rollout.",
        ctaLabel: "Contact",
        ctaHref: "/contact",
        active: true,
      },
    ],
  });

  await db.productService.createMany({
    data: [
      {
        title: "Sponsorship Strategy Packaging",
        slug: "sponsorship-strategy-packaging",
        description:
          "Package structuring, sponsor inventory alignment, and executive-ready commercial positioning.",
        image: "/uploads/jake-image2.jpg",
        featured: true,
        priceLabel: "Custom Proposal",
        active: true,
      },
      {
        title: "Creator Network Activations",
        slug: "creator-network-activations",
        description: "Creator-led media activations built for basketball and brand visibility.",
        image: "/uploads/gab-image.jpg",
        featured: true,
        priceLabel: "Campaign Based",
        active: true,
      },
      {
        title: "Event Branding Support",
        slug: "event-branding-support",
        description: "Event branding execution for sponsor media, uniform placements, and commercial exposure.",
        image: "/uploads/resurgence-logo.jpg",
        featured: false,
        priceLabel: "Quotation",
        active: true,
      },
    ],
  });

  await db.setting.createMany({
    data: [
      { key: "companyBranding", value: "RESURGENCE Powered by DesignXpress" },
      { key: "adminContactData", value: "Jake Anilao | sponsorship@resurgence.designxpress.biz" },
      { key: "publicSiteDefaults", value: JSON.stringify({ followers: "2.15M+", activePlatforms: 2, creators: 6 }) },
      {
        key: "contactInformation",
        value: JSON.stringify({
          email: "sponsorship@resurgence.designxpress.biz",
          support: "support@resurgence.designxpress.biz",
        }),
      },
    ],
  });

  await db.inquiry.createMany({
    data: [
      {
        name: "Marvin Torres",
        email: "marvin@example.com",
        phone: "09171234567",
        company: "Northline Nutrition",
        subject: "Official Brand Partner inquiry",
        message: "We want to discuss creator-led integrations for the next quarter.",
        status: "NEW",
      },
      {
        name: "Alyssa Cruz",
        email: "alyssa@example.com",
        phone: "09179876543",
        company: "StreetCourt Media",
        subject: "Event activation request",
        message: "Can RESURGENCE support sponsor booth placements and creator coverage?",
        status: "REVIEWED",
      },
    ],
  });

  await db.sponsorApplication.createMany({
    data: [
      {
        sponsorName: "Northline Nutrition",
        contactName: "Carlo Mendoza",
        email: "carlo@northline.example",
        phone: "09170001111",
        company: "Northline Nutrition",
        packageInterest: "Official Brand Partner",
        message: "We are interested in creator integrations and event branding.",
        status: SubmissionStatus.APPROVED,
        sponsorId: northline.id,
      },
      {
        sponsorName: "Peak Performance Labs",
        contactName: "Angela Reyes",
        email: "angela@peaklabs.example",
        phone: "09172223333",
        company: "Peak Performance Labs",
        packageInterest: "Major Partner",
        message: "We need premium visibility and a custom commercial package.",
        status: SubmissionStatus.UNDER_REVIEW,
      },
    ],
  });

  await db.sponsorDeliverable.createMany({
    data: [
      {
        sponsorId: northline.id,
        packageId: officialBrandPartner.id,
        title: "Creator Feature Rollout",
        description: "Deliver three creator-led social features for Northline Nutrition.",
        dueDate: new Date(),
        status: DeliverableStatus.IN_PROGRESS,
      },
      {
        sponsorId: northline.id,
        packageId: officialBrandPartner.id,
        title: "Event Poster Branding",
        description: "Add Northline logo placement across official event poster assets.",
        dueDate: new Date(),
        status: DeliverableStatus.PENDING,
      },
    ],
  });

  const invoice1 = await db.invoice.create({
    data: {
      number: "INV-000001",
      sponsorId: northline.id,
      customerName: "Northline Nutrition",
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: "85000",
      balanceDue: "45000",
      status: InvoiceStatus.PARTIALLY_PAID,
      notes: "Official Brand Partner sponsorship billing.",
    },
  });

  const invoice2 = await db.invoice.create({
    data: {
      number: "INV-000002",
      customerName: "Peak Performance Labs",
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      totalAmount: "150000",
      balanceDue: "150000",
      status: InvoiceStatus.OPEN,
      notes: "Major Partner proposal billing.",
    },
  });

  await db.cashierTransaction.createMany({
    data: [
      {
        invoiceId: invoice1.id,
        type: TransactionType.COLLECTION,
        amount: "40000",
        reference: "DEP-001",
        notes: "Initial collection",
      },
      {
        invoiceId: invoice1.id,
        type: TransactionType.ADJUSTMENT,
        amount: "0",
        reference: "ADJ-001",
        notes: "No adjustment",
      },
      {
        invoiceId: invoice2.id,
        type: TransactionType.ADJUSTMENT,
        amount: "0",
        reference: "ADJ-002",
        notes: "Draft preserved",
      },
    ],
  });

  await db.receipt.createMany({
    data: [
      {
        number: "RCT-000001",
        invoiceId: invoice1.id,
        amount: "40000",
        issuedAt: new Date(),
        notes: "Deposit receipt",
      },
    ],
  });

  const admin = await db.user.create({
    data: {
      name: "System Admin",
      email: "admin@resurgence.local",
      passwordHash: password,
      role: Role.SYSTEM_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const cashier = await db.user.create({
    data: {
      name: "Cashier",
      email: "cashier@resurgence.local",
      passwordHash: cashierPassword,
      role: Role.CASHIER,
      status: UserStatus.ACTIVE,
    },
  });

  const sponsorUser = await db.user.create({
    data: {
      name: "Northline Sponsor",
      email: "sponsor@resurgence.local",
      passwordHash: sponsorPassword,
      role: Role.SPONSOR,
      status: UserStatus.ACTIVE,
      sponsorId: northline.id,
    },
  });

  const staff = await db.user.create({
    data: {
      name: "Staff User",
      email: "staff@resurgence.local",
      passwordHash: staffPassword,
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
    },
  });

  const partnerUser = await db.user.create({
    data: {
      name: "Partner User",
      email: "partner@resurgence.local",
      passwordHash: partnerPassword,
      role: Role.PARTNER,
      status: UserStatus.ACTIVE,
      partnerId: partner.id,
    },
  });

  // Creator accounts
  const jakeCreatorPassword = await bcrypt.hash("Jake@2026Resurgence!", 10);
  const joshuaCreatorPassword = await bcrypt.hash("Joshua@2026Resurgence!", 10);
  const gabrielCreatorPassword = await bcrypt.hash("Gabriel@2026Resurgence!", 10);
  const angeloCreatorPassword = await bcrypt.hash("Angelo@2026Resurgence!", 10);
  const marlonCreatorPassword = await bcrypt.hash("Marlon@2026Resurgence!", 10);

  await db.user.upsert({
    where: { email: "jake.anilao@resurgence.local" },
    update: {
      name: "Jake Anilao",
      email: "jake.anilao@resurgence.local",
      passwordHash: jakeCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Jake Anilao",
      email: "jake.anilao@resurgence.local",
      passwordHash: jakeCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
  });

  await db.user.upsert({
    where: { email: "joshua.dollente@resurgence.local" },
    update: {
      name: "Joshua Dollente",
      email: "joshua.dollente@resurgence.local",
      passwordHash: joshuaCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Joshua Dollente",
      email: "joshua.dollente@resurgence.local",
      passwordHash: joshuaCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
  });

  await db.user.upsert({
    where: { email: "gabriel.dimalanta@resurgence.local" },
    update: {
      name: "Gabriel Dimalanta",
      email: "gabriel.dimalanta@resurgence.local",
      passwordHash: gabrielCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Gabriel Dimalanta",
      email: "gabriel.dimalanta@resurgence.local",
      passwordHash: gabrielCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
  });

  await db.user.upsert({
    where: { email: "angelo.deciembre@resurgence.local" },
    update: {
      name: "Angelo Deciembre",
      email: "angelo.deciembre@resurgence.local",
      passwordHash: angeloCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Angelo Deciembre",
      email: "angelo.deciembre@resurgence.local",
      passwordHash: angeloCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
  });

  await db.user.upsert({
    where: { email: "marlon.facundo@resurgence.local" },
    update: {
      name: "Marlon Villamin Facundo",
      email: "marlon.facundo@resurgence.local",
      passwordHash: marlonCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Marlon Villamin Facundo",
      email: "marlon.facundo@resurgence.local",
      passwordHash: marlonCreatorPassword,
      role: Role.CREATOR,
      status: UserStatus.ACTIVE,
    },
  });

await db.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: "New sponsor application",
        message: "Peak Performance Labs submitted a sponsor application.",
      },
      {
        userId: cashier.id,
        title: "Invoice created",
        message: "Invoice INV-000002 is ready for follow-up.",
      },
      {
        userId: sponsorUser.id,
        title: "Deliverable update",
        message: "Creator Feature Rollout is now in progress.",
      },
    ],
  });

  await db.emailQueue.createMany({
    data: [
      {
        toEmail: "carlo@northline.example",
        subject: "Sponsor approval update",
        template: "sponsor_approval",
        payload: { sponsor: "Northline Nutrition", package: "Official Brand Partner" },
        status: EmailQueueStatus.PENDING,
        attempts: 0,
      },
      {
        toEmail: "marvin@example.com",
        subject: "Inquiry received",
        template: "inquiry_received",
        payload: { subject: "Official Brand Partner inquiry" },
        status: EmailQueueStatus.PENDING,
        attempts: 0,
      },
    ],
  });

  
    await db.counter.createMany({
    data: [
      { scope: "invoice", value: 2 },
      { scope: "receipt", value: 1 },
    ],
  });

  await seedSubliCatalog();
  await seedDtfCatalog();

  console.log("Seed completed.");
  console.log("Demo credentials:");
  console.log("admin@resurgence.local / Admin123!");
  console.log("cashier@resurgence.local / Cashier123!");
  console.log("sponsor@resurgence.local / Sponsor123!");
  console.log("staff@resurgence.local / Staff123!");
  console.log("partner@resurgence.local / Partner123!");

  console.log("Creator credentials:");
  console.log("jake.anilao@resurgence.local / Jake@2026Resurgence!");
  console.log("joshua.dollente@resurgence.local / Joshua@2026Resurgence!");
  console.log("gabriel.dimalanta@resurgence.local / Gabriel@2026Resurgence!");
  console.log("angelo.deciembre@resurgence.local / Angelo@2026Resurgence!");
  console.log("marlon.facundo@resurgence.local / Marlon@2026Resurgence!");
}

async function seedSubliCatalog() {
  const rows = [
    ["0001","BASKETBALL JERSEY SET","XS-2XL",900,850,750,700],
    ["0002","BASKETBALL UPPER JERSEY","XS-2XL",null,400,350,300],
    ["0003","BASKETBALL UPPER JERSEY (REVERSIBLE)","XS-2XL",null,600,550,500],
    ["0004","BASKETBALL JERSEY REVERSIBLE & REGULAR SHORT SET","XS-2XL",null,1000,900,800],
    ["0005","BASKETBALL JERSEY REVERSIBLE & SHORT SET","XS-2XL",null,1200,1100,1000],
    ["0006","BASKETBALL JERSEY (REVERSIBLE UPPER W/ REGULAR SHORT)","XS-2XL",null,1100,900,800],
    ["0007","VOLLEYBALL SLEEVE LESS UPPER JERSEY","XS-2XL",null,400,350,300],
    ["0008","VOLLEYBALL T-SHIRT UPPER JERSEY","XS-2XL",null,450,400,350],
    ["0009","VOLLEYBALL SLEEVE LESS JERSEY SET","XS-2XL",null,700,650,600],
    ["0010","VOLLEYBALL T-SHIRT SET","XS-2XL",null,800,750,700],
    ["0011","REGULAR T-SHIRT","XS-2XL",null,450,400,350],
    ["0012","E-SPORT T-SHIRT","XS-2XL",null,500,450,400],
    ["0013","POLO SHIRT (CHINESE/REGULAR COLLAR, BUTTONS/ZIPPER)","XS-2XL",null,500,450,400],
    ["0014","POLO SHIRT (KNITTED COLLAR)","XS-2XL",null,550,500,450],
    ["0015","RIDER LONGSLEEVE (WITH OR W/OUT CUFFS)","XS-2XL",null,600,500,450],
    ["0016","RIDER LONGSLEEVE(CUSTOM COLLAR & ZIPPER WITH OR W/OUT CUFFS)","XS-2XL",null,700,600,550],
    ["0017","SPORTS WARMER HOODIE","XS-2XL",null,650,550,500],
    ["0018","BASEBALL UPPER JERSEY (KNITTED COLLAR)","XS-2XL",null,750,650,600],
    ["0019","BIKE UPPER SHIRT REGULAR SLEEVES","XS-2XL",null,650,550,500],
    ["0020","BIKE UPPER LONGSLEEVE","XS-2XL",null,700,600,550],
    ["0021","BIKE SHIRT R-SLEEVES W/ CYCLING SHORT (PADS INCLUDED)","XS-2XL",null,1300,1200,1100],
    ["0022","BIKE SHIRT L-SLEEVES W/ CYCLING SHORT (PADS INCLUDED)","XS-2XL",null,1400,1300,1200],
    ["0023","CUSTOMIZED CHEERING UNIFORM SET","XS-2XL",null,1800,1700,1600],
    ["0024","CUSTOMIZED MUSE DRESS OR SKIRT UPPER","XS-2XL",null,400,350,300],
    ["0025","VARSITY JACKET (KNITTED COLLAR/ARMBAND/WAISTBAND/LINING/2 POCKETS)","XS-2XL",null,1100,1000,900],
    ["0026","REGULAR VARSITY JACKET (2 POCKETS)","XS-2XL",null,950,850,800],
    ["0027","JACKET WITH HOOD (KANGAROO POCKET) NEOPRENE FABRIC","XS-2XL",null,700,650,600],
    ["0028","JOGGING PANTS (2 SIDE POCKET & 1 BACK POCKET) NEOPRENE FABRIC","XS-2XL",null,650,600,550],
    ["0029","REGULAR SHORT","XS-2XL",null,400,350,300],
    ["0030","REVERSIBLE SHORT","XS-2XL",null,600,550,500],
    ["0031","SHORT (2 POCKETS)","XS-2XL",null,500,450,400],
    ["0032","STANDARD BANNER","2X3 TO 2X4",null,200,150,100],
    ["0033","BIG BANNER","3X5 TO 3X6",null,700,650,600],
  ];

  for (const [externalId, name, sizesLabel, premium, reseller, rprice, storePrice] of rows) {
    const product = await db.productCatalogItem.create({
      data: {
        externalId: String(externalId),
        catalogType: "SUBLI",
        name: String(name),
        sizesLabel: String(sizesLabel),
      },
    });

    const prices = [
      ["PREMIUM", premium],
      ["RESELLER", reseller],
      ["R_PRICE", rprice],
      ["STORE_PRICE", storePrice],
    ] as const;

    for (const [pricingMode, amount] of prices) {
      if (amount == null) continue;

      await db.productFlatPrice.create({
        data: {
          productId: product.id,
          pricingMode,
          amount: String(amount),
        },
      });
    }
  }
}

async function seedDtfCatalog() {
  const rows = [
    ["0001","100% COTTON WHITE 210GSM","FRONT OR BACK (2.5\" to A4 size Print)","XS-XL",245,225,220,"XS-XL",275,255,250,"XS-XL",305,285,280],
    ["0002","100% COTTON WHITE 210GSM","FRONT OR BACK (2.5\" to A4 size Print)","2XL",270,250,245,"2XL",300,280,275,"2XL",330,310,305],
    ["0003","100% COTTON WHITE 210GSM","FRONT OR BACK (2.5\" to A4 size Print)","3XL",275,255,250,"3XL",305,285,280,"3XL",335,315,310],
    ["0004","100% COTTON WHITE 210GSM","FRONT AND BACK (2.5\" to A4 size Print)","XS-XL",265,245,240,"XS-XL",295,275,270,"XS-XL",325,305,300],
    ["0005","100% COTTON WHITE 210GSM","FRONT AND BACK (2.5\" to A4 size Print)","2XL",290,270,265,"2XL",320,300,295,"2XL",350,330,325],
    ["0006","100% COTTON WHITE 210GSM","FRONT AND BACK (2.5\" to A4 size Print)","3XL",295,275,270,"3XL",325,305,300,"3XL",355,335,330],
    ["0007","100% COTTON COLORED 195GSM","FRONT OR BACK (2.5\" to A4 size Print)","XS-XL",265,245,240,"XS-XL",295,275,270,"XS-XL",325,305,300],
    ["0008","100% COTTON COLORED 195GSM","FRONT OR BACK (2.5\" to A4 size Print)","2XL",290,270,265,"2XL",320,300,295,"2XL",350,330,325],
    ["0009","100% COTTON COLORED 195GSM","FRONT OR BACK (2.5\" to A4 size Print)","3XL",294,274,269,"3XL",324,304,299,"3XL",354,334,329],
    ["0010","100% COTTON COLORED 195GSM","FRONT AND BACK (2.5\" to A4 size Print)","XS-XL",280,260,255,"XS-XL",310,290,285,"XS-XL",340,320,315],
    ["0011","100% COTTON COLORED 195GSM","FRONT AND BACK (2.5\" to A4 size Print)","2XL",310,290,285,"2XL",340,320,315,"2XL",370,350,345],
    ["0012","100% COTTON COLORED 195GSM","FRONT AND BACK (2.5\" to A4 size Print)","3XL",314,294,289,"3XL",344,324,319,"3XL",374,354,349],
  ];

  for (const row of rows) {
    const [
      externalId, fabricProduct, printType,
      storeSize, store1_9, store10_50, store51_300,
      agentSize, agent1_9, agent10_50, agent51_300,
      srpSize, srp1_9, srp10_50, srp51_300,
    ] = row;

    const product = await db.productCatalogItem.create({
      data: {
        externalId: String(externalId),
        catalogType: "DTF",
        name: `${fabricProduct} - ${printType}`,
        description: String(printType),
        fabricProduct: String(fabricProduct),
        printType: String(printType),
      },
    });

    const insertTier = async (
      pricingMode: "STORE" | "AGENT" | "SRP",
      sizeLabel: string,
      minQty: number,
      maxQty: number | null,
      amount: number
    ) => {
      await db.productTierPrice.create({
        data: {
          productId: product.id,
          pricingMode,
          sizeLabel,
          minQty,
          maxQty,
          amount: String(amount),
        },
      });
    };

    await insertTier("STORE", String(storeSize), 1, 9, Number(store1_9));
    await insertTier("STORE", String(storeSize), 10, 50, Number(store10_50));
    await insertTier("STORE", String(storeSize), 51, 300, Number(store51_300));

    await insertTier("AGENT", String(agentSize), 1, 9, Number(agent1_9));
    await insertTier("AGENT", String(agentSize), 10, 50, Number(agent10_50));
    await insertTier("AGENT", String(agentSize), 51, 300, Number(agent51_300));

    await insertTier("SRP", String(srpSize), 1, 9, Number(srp1_9));
    await insertTier("SRP", String(srpSize), 10, 50, Number(srp10_50));
    await insertTier("SRP", String(srpSize), 51, 300, Number(srp51_300));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
