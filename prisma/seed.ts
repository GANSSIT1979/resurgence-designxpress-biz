import bcrypt from "bcryptjs";
import { PrismaClient, Role, UserStatus, SubmissionStatus, SponsorStatus, PartnerStatus, PackageStatus, DeliverableStatus, InvoiceStatus, TransactionType, EmailQueueStatus } from "@prisma/client";

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
      sortOrder: 1
    }
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
      sortOrder: 2
    }
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
      sortOrder: 3
    }
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
      sortOrder: 4
    }
  });

  const northline = await db.sponsor.create({
    data: {
      name: "Northline Nutrition",
      slug: "northline-nutrition",
      description: "Official nutrition partner focused on performance support and athlete recovery.",
      website: "https://example.com/northline",
      logo: "/uploads/resurgence-logo.jpg",
      status: SponsorStatus.ACTIVE,
      packageId: officialBrandPartner.id
    }
  });

  const partner = await db.partner.create({
    data: {
      name: "DesignXpress Premium Quality",
      slug: "designxpress-premium-quality",
      description: "Production and branding support partner for premium sports-business execution.",
      website: "https://designxpress.biz",
      logo: "/uploads/resurgence-logo.jpg",
      status: PartnerStatus.ACTIVE
    }
  });

  await db.sponsorProfile.create({
    data: {
      sponsorId: northline.id,
      packageId: officialBrandPartner.id,
      headline: "Performance-led nutrition support for RESURGENCE athletes",
      description: "Northline Nutrition powers high-performance basketball routines with sponsor-aligned athlete support programs.",
      contactName: "Northline Partnerships",
      contactEmail: "partnerships@northline.example",
      logo: "/uploads/resurgence-logo.jpg"
    }
  });

  const creators = [
    {
      fullName: "Jake Anilao",
      slug: "jake-anilao",
      biography: "Lead basketball personality and business-facing face of RESURGENCE.",
      journeyStory: "Jake built a sports community rooted in coaching presence, creator-led storytelling, and sponsorship-ready basketball branding.",
      pointsPerGame: 19.4,
      assistsPerGame: 6.8,
      reboundsPerGame: 7.2,
      image: "/uploads/jake-image1.jpg",
      socialLinks: { Facebook: "https://facebook.com/jakeanilao", TikTok: "https://tiktok.com/@jakeanilao" },
      featured: true
    },
    {
      fullName: "Gab Dimalanta",
      slug: "gab-dimalanta",
      biography: "Athlete creator with audience pull and strong game identity.",
      journeyStory: "Gab’s creator journey blends competitive basketball visibility with sponsor-friendly media exposure.",
      pointsPerGame: 16.7,
      assistsPerGame: 5.1,
      reboundsPerGame: 6.4,
      image: "/uploads/gab-image.jpg",
      socialLinks: { Facebook: "https://facebook.com/gabdimalanta", Instagram: "https://instagram.com/gabdimalanta" },
      featured: true
    },
    {
      fullName: "KlengTV",
      slug: "klengtv",
      biography: "Entertainment-forward creator with sports crossover appeal.",
      journeyStory: "KlengTV brings energy, audience interaction, and creator versatility to basketball-led content campaigns.",
      pointsPerGame: 11.3,
      assistsPerGame: 4.8,
      reboundsPerGame: 4.5,
      image: "/uploads/ken-image1.jpg",
      socialLinks: { YouTube: "https://youtube.com/@klengtv", Facebook: "https://facebook.com/klengtv" },
      featured: true
    },
    {
      fullName: "Macofacundo",
      slug: "macofacundo",
      biography: "Community basketball creator with high relatability and on-ground impact.",
      journeyStory: "Macofacundo grew from local-court visibility into a creator asset with strong audience engagement.",
      pointsPerGame: 14.9,
      assistsPerGame: 4.2,
      reboundsPerGame: 5.6,
      image: "/uploads/macol-image1.jpg",
      socialLinks: { Facebook: "https://facebook.com/macofacundo" },
      featured: false
    },
    {
      fullName: "Angelo H. Deciembre",
      slug: "angelo-h-deciembre",
      biography: "Basketball personality with creator and event activation value.",
      journeyStory: "Angelo blends competitive identity and marketable presence into sponsor-ready creator positioning.",
      pointsPerGame: 13.8,
      assistsPerGame: 3.9,
      reboundsPerGame: 5.2,
      image: "/uploads/angelo-image1.jpg",
      socialLinks: { Facebook: "https://facebook.com/angelodeciembre" },
      featured: false
    },
    {
      fullName: "Klint Almine",
      slug: "klint-almine",
      biography: "Strong creator profile with basketball-first media storytelling.",
      journeyStory: "Klint’s content path emphasizes player performance, discipline, and commercial brand friendliness.",
      pointsPerGame: 15.2,
      assistsPerGame: 5.7,
      reboundsPerGame: 6.1,
      image: "/uploads/klint-image1.jpg",
      socialLinks: { Facebook: "https://facebook.com/klintalmine" },
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
      featured: true
    }
  });

  const sponsorNight = await db.mediaEvent.create({
    data: {
      title: "Sponsor Partnership Night",
      slug: "sponsor-partnership-night",
      description: "Partner and sponsor engagement visuals.",
      featured: true
    }
  });

  await db.galleryMedia.createMany({
    data: [
      {
        title: "Coach Jake Feature Poster",
        caption: "Hero media for sponsor positioning",
        description: "Featured homepage poster media.",
        image: "/uploads/jake-image2.jpg",
        featured: true,
        eventId: launchEvent.id
      },
      {
        title: "Jake Portrait",
        caption: "Creator hero portrait",
        description: "Creator portrait for the homepage and creator network preview.",
        image: "/uploads/jake-image1.jpg",
        featured: true,
        eventId: launchEvent.id
      },
      {
        title: "Gab Action Feature",
        caption: "Creator campaign media",
        description: "Featured creator action media.",
        image: "/uploads/gab-image.jpg",
        featured: true,
        eventId: sponsorNight.id
      },
      {
        title: "Klint Creator Asset",
        caption: "Campaign visual",
        description: "Sponsor-ready creator asset.",
        image: "/uploads/klint-image1.jpg",
        featured: true,
        eventId: sponsorNight.id
      }
    ]
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
        active: true
      },
      {
        title: "Social Media Integration Block",
        category: "Digital Integration",
        description: "Brand integration across scheduled sponsor content releases.",
        value: "18000",
        image: "/uploads/jake-image3.jpg",
        packageApplicability: ["Supporting Sponsor", "Official Brand Partner", "Major Partner"],
        active: true
      },
      {
        title: "On-Ground Booth Visibility",
        category: "On-Ground Activation",
        description: "Physical event placement and activation area support.",
        value: "35000",
        image: "/uploads/jake-image2.jpg",
        packageApplicability: ["Major Partner", "Event Presenting"],
        active: true
      },
      {
        title: "Commercial Support Video Feature",
        category: "Commercial Support",
        description: "Creator-backed commercial media content support.",
        value: "42000",
        image: "/uploads/gab-image.jpg",
        packageApplicability: ["Official Brand Partner", "Major Partner", "Event Presenting"],
        active: true
      }
    ]
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
        active: true
      },
      {
        key: "contact-jake",
        title: "Contact Jake",
        subtitle: "Direct business coordination",
        body: "Coordinate sponsorship packages, creator integration, and campaign rollout.",
        ctaLabel: "Contact",
        ctaHref: "/contact",
        active: true
      }
    ]
  });

  await db.productService.createMany({
    data: [
      {
        title: "Sponsorship Strategy Packaging",
        slug: "sponsorship-strategy-packaging",
        description: "Package structuring, sponsor inventory alignment, and executive-ready commercial positioning.",
        image: "/uploads/jake-image2.jpg",
        featured: true,
        priceLabel: "Custom Proposal",
        active: true
      },
      {
        title: "Creator Network Activations",
        slug: "creator-network-activations",
        description: "Creator-led media activations built for basketball and brand visibility.",
        image: "/uploads/gab-image.jpg",
        featured: true,
        priceLabel: "Campaign Based",
        active: true
      },
      {
        title: "Event Branding Support",
        slug: "event-branding-support",
        description: "Event branding execution for sponsor media, uniform placements, and commercial exposure.",
        image: "/uploads/resurgence-logo.jpg",
        featured: false,
        priceLabel: "Quotation",
        active: true
      }
    ]
  });

  await db.setting.createMany({
    data: [
      { key: "companyBranding", value: "RESURGENCE Powered by DesignXpress" },
      { key: "adminContactData", value: "Jake Anilao | sponsorship@resurgence.designxpress.biz" },
      { key: "publicSiteDefaults", value: JSON.stringify({ followers: "2.15M+", activePlatforms: 2, creators: 6 }) },
      { key: "contactInformation", value: JSON.stringify({ email: "sponsorship@resurgence.designxpress.biz", support: "support@resurgence.designxpress.biz" }) }
    ]
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
        status: "NEW"
      },
      {
        name: "Alyssa Cruz",
        email: "alyssa@example.com",
        phone: "09179876543",
        company: "StreetCourt Media",
        subject: "Event activation request",
        message: "Can RESURGENCE support sponsor booth placements and creator coverage?",
        status: "REVIEWED"
      }
    ]
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
        sponsorId: northline.id
      },
      {
        sponsorName: "Peak Performance Labs",
        contactName: "Angela Reyes",
        email: "angela@peaklabs.example",
        phone: "09172223333",
        company: "Peak Performance Labs",
        packageInterest: "Major Partner",
        message: "We need premium visibility and a custom commercial package.",
        status: SubmissionStatus.UNDER_REVIEW
      }
    ]
  });

  await db.sponsorDeliverable.createMany({
    data: [
      {
        sponsorId: northline.id,
        packageId: officialBrandPartner.id,
        title: "Creator Feature Rollout",
        description: "Deliver three creator-led social features for Northline Nutrition.",
        dueDate: new Date(),
        status: DeliverableStatus.IN_PROGRESS
      },
      {
        sponsorId: northline.id,
        packageId: officialBrandPartner.id,
        title: "Event Poster Branding",
        description: "Add Northline logo placement across official event poster assets.",
        dueDate: new Date(),
        status: DeliverableStatus.PENDING
      }
    ]
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
      notes: "Official Brand Partner sponsorship billing."
    }
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
      notes: "Major Partner proposal billing."
    }
  });

  await db.cashierTransaction.createMany({
    data: [
      {
        invoiceId: invoice1.id,
        type: TransactionType.COLLECTION,
        amount: "40000",
        reference: "DEP-001",
        notes: "Initial collection"
      },
      {
        invoiceId: invoice1.id,
        type: TransactionType.ADJUSTMENT,
        amount: "0",
        reference: "ADJ-001",
        notes: "No adjustment"
      },
      {
        invoiceId: invoice2.id,
        type: TransactionType.ADJUSTMENT,
        amount: "0",
        reference: "ADJ-002",
        notes: "Draft preserved"
      }
    ]
  });

  await db.receipt.createMany({
    data: [
      {
        number: "RCT-000001",
        invoiceId: invoice1.id,
        amount: "40000",
        issuedAt: new Date(),
        notes: "Deposit receipt"
      }
    ]
  });

  const admin = await db.user.create({
    data: {
      name: "System Admin",
      email: "admin@resurgence.local",
      passwordHash: password,
      role: Role.SYSTEM_ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  const cashier = await db.user.create({
    data: {
      name: "Cashier",
      email: "cashier@resurgence.local",
      passwordHash: cashierPassword,
      role: Role.CASHIER,
      status: UserStatus.ACTIVE
    }
  });

  const sponsorUser = await db.user.create({
    data: {
      name: "Northline Sponsor",
      email: "sponsor@resurgence.local",
      passwordHash: sponsorPassword,
      role: Role.SPONSOR,
      status: UserStatus.ACTIVE,
      sponsorId: northline.id
    }
  });

  const staff = await db.user.create({
    data: {
      name: "Staff User",
      email: "staff@resurgence.local",
      passwordHash: staffPassword,
      role: Role.STAFF,
      status: UserStatus.ACTIVE
    }
  });

  const partnerUser = await db.user.create({
    data: {
      name: "Partner User",
      email: "partner@resurgence.local",
      passwordHash: partnerPassword,
      role: Role.PARTNER,
      status: UserStatus.ACTIVE,
      partnerId: partner.id
    }
  });

  await db.notification.createMany({
    data: [
      { userId: admin.id, title: "New sponsor application", message: "Peak Performance Labs submitted a sponsor application." },
      { userId: cashier.id, title: "Invoice created", message: "Invoice INV-000002 is ready for follow-up." },
      { userId: sponsorUser.id, title: "Deliverable update", message: "Creator Feature Rollout is now in progress." }
    ]
  });

  await db.emailQueue.createMany({
    data: [
      {
        toEmail: "carlo@northline.example",
        subject: "Sponsor approval update",
        template: "sponsor_approval",
        payload: { sponsor: "Northline Nutrition", package: "Official Brand Partner" },
        status: EmailQueueStatus.PENDING,
        attempts: 0
      },
      {
        toEmail: "marvin@example.com",
        subject: "Inquiry received",
        template: "inquiry_received",
        payload: { subject: "Official Brand Partner inquiry" },
        status: EmailQueueStatus.PENDING,
        attempts: 0
      }
    ]
  });

  await db.counter.createMany({
    data: [
      { scope: "invoice", value: 2 },
      { scope: "receipt", value: 1 }
    ]
  });

  console.log("Seed completed.");
  console.log("Demo credentials:");
  console.log("admin@resurgence.local / Admin123!");
  console.log("cashier@resurgence.local / Cashier123!");
  console.log("sponsor@resurgence.local / Sponsor123!");
  console.log("staff@resurgence.local / Staff123!");
  console.log("partner@resurgence.local / Partner123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
