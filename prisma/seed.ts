import {
  AgreementStatus,
  AnnouncementLevel,
  CashierTransactionKind,
  DeliverableStatus,
  EmailAutomationStatus,
  GalleryMediaType,
  InvoiceStatus,
  PartnerCampaignStatus,
  PartnerReferralStatus,
  PaymentMethod,
  PrismaClient,
  SponsorSubmissionStatus,
  ShopPaymentMethod,
  ShopOrderStatus,
  ShopPaymentStatus,
  StaffTaskPriority,
  StaffTaskStatus,
  UserRole,
} from '@prisma/client';
import { hashPassword } from '../src/lib/passwords';
import {
  creatorNetwork,
  sponsorInventoryCategories,
  sponsorPackageTemplates,
  sponsorshipStats,
} from '../src/lib/resurgence';

const prisma = new PrismaClient();

async function main() {
  const lineBreak = '\n';

  const users = [
    {
      email: 'admin@resurgence.local',
      password: 'ChangeMe123!',
      displayName: 'System Administrator',
      title: 'Full platform owner',
      role: UserRole.SYSTEM_ADMIN,
    },
    {
      email: 'cashier@resurgence.local',
      password: 'Cashier123!',
      displayName: 'Finance Cashier',
      title: 'Billing and receipts',
      role: UserRole.CASHIER,
    },
    {
      email: 'sponsor@resurgence.local',
      password: 'Sponsor123!',
      displayName: 'Northline Nutrition',
      title: 'Sponsor portal demo',
      role: UserRole.SPONSOR,
    },
    {
      email: 'staff@resurgence.local',
      password: 'Staff123!',
      displayName: 'Operations Staff',
      title: 'Coordination and follow-up',
      role: UserRole.STAFF,
    },
    {
      email: 'partner@resurgence.local',
      password: 'Partner123!',
      displayName: 'Alliance Partner',
      title: 'Partner portal demo',
      role: UserRole.PARTNER,
    },
  ];

  const lastLoginSeed: Record<string, Date> = {
    'admin@resurgence.local': new Date('2026-04-13T09:00:00.000Z'),
    'cashier@resurgence.local': new Date('2026-04-14T01:15:00.000Z'),
    'sponsor@resurgence.local': new Date('2026-04-12T15:45:00.000Z'),
    'staff@resurgence.local': new Date('2026-04-14T00:20:00.000Z'),
    'partner@resurgence.local': new Date('2026-04-11T13:10:00.000Z'),
  };

  const sponsors = [
    {
      name: 'Northline Nutrition',
      slug: 'northline-nutrition',
      tier: 'Official Brand Partner',
      logoUrl: '/assets/resurgence-logo.jpg',
      websiteUrl: 'https://northline.example',
      shortDescription: 'Health and wellness sponsor focused on performance nutrition and creator-led brand storytelling.',
      packageValue: 'PHP 75,000–95,000',
      benefits: ['Digital integration', 'Creator mentions', 'Social campaign support', 'Event partner positioning'].join(lineBreak),
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Skyline Apparel',
      slug: 'skyline-apparel',
      tier: 'Major Partner',
      logoUrl: '/assets/resurgence-poster.jpg',
      websiteUrl: 'https://skyline.example',
      shortDescription: 'Apparel brand with premium event placement and creator-integrated campaign execution.',
      packageValue: 'PHP 120,000–150,000',
      benefits: ['Premium logo placement', 'Creator network content', 'On-ground activation support', 'Commercial support'].join(lineBreak),
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Community Fuel Cafe',
      slug: 'community-fuel-cafe',
      tier: 'Supporting Sponsor',
      logoUrl: '/assets/resurgence-logo.jpg',
      websiteUrl: 'https://communityfuel.example',
      shortDescription: 'Community-facing brand using grassroots sponsorship visibility and event activations.',
      packageValue: 'PHP 15,000–50,000',
      benefits: ['Selective logo visibility', 'Event acknowledgment', 'Basic digital inclusion', 'Community support branding'].join(lineBreak),
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Apex Telecom',
      slug: 'apex-telecom',
      tier: 'Event Presenting',
      logoUrl: '/assets/resurgence-poster.jpg',
      websiteUrl: 'https://apextelecom.example',
      shortDescription: 'Headline presenting sponsor with custom rights, broad visibility, and tailored activation.',
      packageValue: 'Custom Proposal',
      benefits: ['Presenting rights', 'Custom proposal structure', 'Priority activation planning', 'Commercial lead support'].join(lineBreak),
      sortOrder: 4,
      isActive: true,
    },
  ];

  const partners = [
    {
      name: 'Community Brand Alliance',
      slug: 'community-brand-alliance',
      category: 'Brand Collaboration',
      logoUrl: '/assets/resurgence-logo.jpg',
      websiteUrl: '',
      shortDescription: 'Supports campaign amplification, event-ready co-branding, and audience expansion.',
      services: ['Referral growth', 'Campaign collaboration', 'Shared branding materials', 'Community activation support'].join(lineBreak),
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Sports Media Partner',
      slug: 'sports-media-partner',
      category: 'Media',
      logoUrl: '/assets/resurgence-poster.jpg',
      websiteUrl: '',
      shortDescription: 'Expands digital visibility through sports coverage, highlight support, and branded distribution.',
      services: ['Creator support', 'Media visibility', 'Campaign recaps', 'Sponsor callout amplification'].join(lineBreak),
      sortOrder: 2,
      isActive: true,
    },
  ];

  const shopCategories = [
    {
      name: 'Jerseys',
      slug: 'jerseys',
      description: 'Official team and creator jersey releases.',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Shirts, hoodies, and casual wear.',
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Caps, tumblers, and add-on merch.',
      sortOrder: 3,
      isActive: true,
    },
  ];

  const shopProducts = [
    {
      name: 'Resurgence Black Jersey',
      slug: 'resurgence-black-jersey',
      sku: 'RSG-JSY-001',
      description: 'Official Resurgence performance jersey in black and red with premium athletic fit and event-ready branding.',
      shortDescription: 'Official black jersey drop',
      price: 1299,
      compareAtPrice: 1499,
      stock: 40,
      imageUrl: '/assets/resurgence-poster.jpg',
      sortOrder: 1,
      isActive: true,
      isFeatured: true,
      categorySlug: 'jerseys',
    },
    {
      name: 'Resurgence Training Hoodie',
      slug: 'resurgence-training-hoodie',
      sku: 'RSG-HOD-001',
      description: 'Comfort-fit hoodie for players, creators, and supporters with premium Resurgence branding.',
      shortDescription: 'Heavyweight training hoodie',
      price: 1599,
      compareAtPrice: 1899,
      stock: 25,
      imageUrl: '/assets/jake-image2.jpg',
      sortOrder: 2,
      isActive: true,
      isFeatured: true,
      categorySlug: 'apparel',
    },
    {
      name: 'Resurgence Signature Cap',
      slug: 'resurgence-signature-cap',
      sku: 'RSG-CAP-001',
      description: 'Structured cap with clean front branding for casual wear and courtside presence.',
      shortDescription: 'Signature cap',
      price: 499,
      compareAtPrice: 699,
      stock: 60,
      imageUrl: '/assets/resurgence-logo.jpg',
      sortOrder: 3,
      isActive: true,
      isFeatured: true,
      categorySlug: 'accessories',
    },
    {
      name: 'Resurgence Team Shirt',
      slug: 'resurgence-team-shirt',
      sku: 'RSG-TSH-001',
      description: 'Official team shirt for community drops, events, and creator campaigns.',
      shortDescription: 'Core team shirt',
      price: 699,
      compareAtPrice: 799,
      stock: 55,
      imageUrl: '/assets/gab-image.jpg',
      sortOrder: 4,
      isActive: true,
      isFeatured: false,
      categorySlug: 'apparel',
    },
  ];

  const content = [
    {
      key: 'home.hero',
      title: 'RESURGENCE Powered by DesignXpress',
      subtitle: '2026 Sponsorship Proposal • Sports • Media • Brand Growth',
      body: `A sponsorship-driven sports and creator platform with ${sponsorshipStats.combinedFollowers} combined followers, ${sponsorshipStats.activePlatforms} active platforms, and ${sponsorshipStats.creatorCount} high-engagement creators.`,
      ctaLabel: 'Apply as Sponsor',
      ctaHref: '/sponsor/apply',
    },
    {
      key: 'home.about',
      title: 'Built for sponsorship visibility, creator-led storytelling, and measurable activation.',
      subtitle: 'Opportunity Summary',
      body: 'RESURGENCE Powered by DesignXpress combines creator network reach, sports community trust, digital integration, on-ground activation, and commercial support into one premium sponsorship platform.',
      ctaLabel: 'View Sponsor Packages',
      ctaHref: '/sponsors',
    },
    {
      key: 'about.story',
      title: 'Who We Are',
      subtitle: 'Sports-business platform with creator-powered reach',
      body: 'The platform is structured to help brands, partners, and communities activate campaigns through premium sponsorship packaging, creator collaboration, and basketball-first audience engagement.',
      ctaLabel: 'Contact Jake',
      ctaHref: '/contact',
    },
    {
      key: 'services.intro',
      title: 'Integrated sponsorship and sports services',
      subtitle: 'What We Deliver',
      body: 'From branding assets and digital integration to on-ground activation and commercial support, the platform delivers sponsor-ready solutions across the RESURGENCE ecosystem.',
      ctaLabel: 'Request a proposal',
      ctaHref: '/contact',
    },
    {
      key: 'contact.details',
      title: "Let's build a premium sponsorship package together.",
      subtitle: 'Contact & Inquiry',
      body: 'Use the inquiry form to request sponsor packages, creator integration, on-ground activation support, commercial proposals, or partnership discussions. For direct business discussions, contact Jake Anilao.',
      ctaLabel: 'Open sponsor application',
      ctaHref: '/sponsor/apply',
    },
  ];

  for (const user of users) {
    const payload = {
      email: user.email,
      password: hashPassword(user.password),
      displayName: user.displayName,
      title: user.title,
      role: user.role,
      lastLoginAt: lastLoginSeed[user.email] || null,
    };

    await prisma.user.upsert({
      where: { email: user.email },
      update: payload,
      create: payload,
    });
  }

  for (const sponsor of sponsors) {
    await prisma.sponsor.upsert({ where: { slug: sponsor.slug }, update: sponsor, create: sponsor });
  }

  for (const partner of partners) {
    await prisma.partner.upsert({ where: { slug: partner.slug }, update: partner, create: partner });
  }

  for (const entry of content) {
    await prisma.pageContent.upsert({ where: { key: entry.key }, update: entry, create: entry });
  }

  for (const [index, template] of sponsorPackageTemplates.entries()) {
    await prisma.sponsorPackageTemplate.upsert({
      where: { name: template.name },
      update: {
        tier: template.tier,
        rangeLabel: template.rangeLabel,
        summary: template.summary,
        benefits: template.benefits.join(lineBreak),
        isActive: true,
        sortOrder: index + 1,
      },
      create: {
        name: template.name,
        tier: template.tier,
        rangeLabel: template.rangeLabel,
        summary: template.summary,
        benefits: template.benefits.join(lineBreak),
        isActive: true,
        sortOrder: index + 1,
      },
    });
  }

  for (const [index, creator] of creatorNetwork.entries()) {
    await prisma.creatorProfile.upsert({
      where: { slug: creator.slug },
      update: {
        name: creator.name,
        roleLabel: creator.role,
        platformFocus: creator.platformFocus,
        audience: creator.audience,
        biography: creator.biography,
        journeyStory: creator.journeyStory,
        pointsPerGame: creator.pointsPerGame,
        assistsPerGame: creator.assistsPerGame,
        reboundsPerGame: creator.reboundsPerGame,
        imageUrl: creator.imageUrl,
        isActive: true,
        sortOrder: index + 1,
      },
      create: {
        name: creator.name,
        slug: creator.slug,
        roleLabel: creator.role,
        platformFocus: creator.platformFocus,
        audience: creator.audience,
        biography: creator.biography,
        journeyStory: creator.journeyStory,
        pointsPerGame: creator.pointsPerGame,
        assistsPerGame: creator.assistsPerGame,
        reboundsPerGame: creator.reboundsPerGame,
        imageUrl: creator.imageUrl,
        isActive: true,
        sortOrder: index + 1,
      },
    });
  }

  for (const [index, category] of sponsorInventoryCategories.entries()) {
    await prisma.sponsorInventoryCategory.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
        examples: category.examples.join(lineBreak),
        isActive: true,
        sortOrder: index + 1,
      },
      create: {
        name: category.name,
        description: category.description,
        examples: category.examples.join(lineBreak),
        isActive: true,
        sortOrder: index + 1,
      },
    });
  }



  await prisma.galleryMedia.deleteMany();
  await prisma.mediaEvent.deleteMany();

  const creatorRecords = await prisma.creatorProfile.findMany({ orderBy: { sortOrder: 'asc' } });
  const jakeCreator = creatorRecords.find((item) => item.slug === 'jake-anilao');
  const gabCreator = creatorRecords.find((item) => item.slug === 'gab-dimalanta');
  const klintCreator = creatorRecords.find((item) => item.slug === 'klint-almine');

  const gallerySeed = [
    {
      title: 'Opening Night Community Games',
      description: 'Basketball energy, crowd participation, and sponsor visibility from opening night activities.',
      eventDate: new Date('2026-04-10'),
      creatorId: jakeCreator?.id || null,
      sortOrder: 1,
      isActive: true,
      mediaItems: [
        { mediaType: GalleryMediaType.VIDEO, url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', thumbnailUrl: '/assets/resurgence-poster.jpg', caption: 'Autoplay native highlight reel', sortOrder: 1 },
        { mediaType: GalleryMediaType.IMAGE, url: '/assets/resurgence-poster.jpg', thumbnailUrl: '', caption: 'Opening night atmosphere', sortOrder: 2 },
        { mediaType: GalleryMediaType.IMAGE, url: '/assets/resurgence-logo.jpg', thumbnailUrl: '', caption: 'Brand identity and event visuals', sortOrder: 3 },
      ],
    },
    {
      title: 'Creator Athlete Feature',
      description: 'A spotlight event for athlete-led storytelling, drills, and digital highlight capture.',
      eventDate: new Date('2026-04-12'),
      creatorId: gabCreator?.id || null,
      sortOrder: 2,
      isActive: true,
      mediaItems: [
        { mediaType: GalleryMediaType.YOUTUBE, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '/assets/resurgence-poster.jpg', caption: 'Creator-led highlight video', sortOrder: 1 },
        { mediaType: GalleryMediaType.IMAGE, url: '/assets/resurgence-poster.jpg', thumbnailUrl: '', caption: 'Behind-the-scenes event still', sortOrder: 2 },
        { mediaType: GalleryMediaType.IMAGE, url: '/assets/resurgence-logo.jpg', thumbnailUrl: '', caption: 'Sponsored moment branding frame', sortOrder: 3 },
      ],
    },
    {
      title: 'Emerging Creator Media Day',
      description: 'Portraits, interviews, and supporting content for the next wave of RESURGENCE creators.',
      eventDate: new Date('2026-04-15'),
      creatorId: klintCreator?.id || null,
      sortOrder: 3,
      isActive: true,
      mediaItems: [
        { mediaType: GalleryMediaType.VIMEO, url: 'https://vimeo.com/76979871', thumbnailUrl: '', caption: 'Short creator feature reel', sortOrder: 1 },
        { mediaType: GalleryMediaType.IMAGE, url: '/assets/resurgence-logo.jpg', thumbnailUrl: '', caption: 'Creator media day branding', sortOrder: 2 },
      ],
    },
  ];

  for (const event of gallerySeed) {
    const createdEvent = await prisma.mediaEvent.create({
      data: {
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        creatorId: event.creatorId,
        sortOrder: event.sortOrder,
        isActive: event.isActive,
      },
    });

    for (const mediaItem of event.mediaItems) {
      await prisma.galleryMedia.create({
        data: {
          mediaEventId: createdEvent.id,
          mediaType: mediaItem.mediaType,
          url: mediaItem.url,
          thumbnailUrl: mediaItem.thumbnailUrl || null,
          caption: mediaItem.caption || null,
          sortOrder: mediaItem.sortOrder,
        },
      });
    }
  }

  const sponsorUser = await prisma.user.findUniqueOrThrow({ where: { email: 'sponsor@resurgence.local' } });
  const staffUser = await prisma.user.findUniqueOrThrow({ where: { email: 'staff@resurgence.local' } });
  const partnerUser = await prisma.user.findUniqueOrThrow({ where: { email: 'partner@resurgence.local' } });
  const sponsorRecords = await prisma.sponsor.findMany({ orderBy: { sortOrder: 'asc' } });
  const partnerRecords = await prisma.partner.findMany({ orderBy: { sortOrder: 'asc' } });
  const packageRecords = await prisma.sponsorPackageTemplate.findMany({ orderBy: { sortOrder: 'asc' } });

  const northlineSponsor = sponsorRecords.find((item) => item.slug === 'northline-nutrition');
  const northlinePackage = packageRecords.find((item) => item.name === 'Official Brand Partner');
  const alliancePartner = partnerRecords.find((item) => item.slug === 'community-brand-alliance');

  const sponsorProfile = await prisma.sponsorProfile.upsert({
    where: { userId: sponsorUser.id },
    update: {
      sponsorId: northlineSponsor?.id,
      preferredPackageId: northlinePackage?.id,
      companyName: 'Northline Nutrition',
      contactName: 'Brand Sponsor',
      contactEmail: 'sponsor@resurgence.local',
      phone: '09171230000',
      websiteUrl: 'https://northline.example',
      address: 'Quezon City, Metro Manila',
      brandSummary: 'Performance nutrition brand using RESURGENCE for creator-led digital integration, event visibility, and sponsor storytelling.',
      assetLink: 'https://drive.example/northline-brand-assets',
    },
    create: {
      userId: sponsorUser.id,
      sponsorId: northlineSponsor?.id,
      preferredPackageId: northlinePackage?.id,
      companyName: 'Northline Nutrition',
      contactName: 'Brand Sponsor',
      contactEmail: 'sponsor@resurgence.local',
      phone: '09171230000',
      websiteUrl: 'https://northline.example',
      address: 'Quezon City, Metro Manila',
      brandSummary: 'Performance nutrition brand using RESURGENCE for creator-led digital integration, event visibility, and sponsor storytelling.',
      assetLink: 'https://drive.example/northline-brand-assets',
    },
  });

  const staffProfile = await prisma.staffProfile.upsert({
    where: { userId: staffUser.id },
    update: {
      department: 'Operations',
      bio: 'Handles sponsor coordination, inquiry routing, schedules, and internal announcements.',
    },
    create: {
      userId: staffUser.id,
      department: 'Operations',
      bio: 'Handles sponsor coordination, inquiry routing, schedules, and internal announcements.',
    },
  });

  const partnerProfile = await prisma.partnerProfile.upsert({
    where: { userId: partnerUser.id },
    update: {
      partnerId: alliancePartner?.id,
      companyName: 'Alliance Partner',
      contactName: 'Alliance Partner',
      contactEmail: 'partner@resurgence.local',
      phone: '09175551234',
      websiteUrl: 'https://alliance.example',
      address: 'Makati City, Metro Manila',
      companySummary: 'Collaboration partner focused on campaign amplification, shared branding, and warm sponsor referrals.',
      assetLink: 'https://drive.example/alliance-partner-assets',
      preferredServices: ['Campaign planning', 'Referral introductions', 'Shared branding materials'].join(lineBreak),
    },
    create: {
      userId: partnerUser.id,
      partnerId: alliancePartner?.id,
      companyName: 'Alliance Partner',
      contactName: 'Alliance Partner',
      contactEmail: 'partner@resurgence.local',
      phone: '09175551234',
      websiteUrl: 'https://alliance.example',
      address: 'Makati City, Metro Manila',
      companySummary: 'Collaboration partner focused on campaign amplification, shared branding, and warm sponsor referrals.',
      assetLink: 'https://drive.example/alliance-partner-assets',
      preferredServices: ['Campaign planning', 'Referral introductions', 'Shared branding materials'].join(lineBreak),
    },
  });

  const serviceSeed = [
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
      ].join(lineBreak),
      priceLabel: 'Custom Proposal',
      sortOrder: 1,
      isActive: true,
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
      ].join(lineBreak),
      priceLabel: 'Custom Proposal',
      sortOrder: 2,
      isActive: true,
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
      ].join(lineBreak),
      priceLabel: 'Custom Proposal',
      sortOrder: 3,
      isActive: true,
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
      ].join(lineBreak),
      priceLabel: 'Quotation Based',
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const item of serviceSeed) {
    const existing = await prisma.productService.findFirst({ where: { name: item.name } });
    if (existing) {
      await prisma.productService.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.productService.create({ data: item });
    }
  }

  const inquiries = [
    {
      name: 'Brand Launch Team',
      organization: 'Velocity Consumer Goods',
      email: 'launch@velocity.example',
      phone: '09170000001',
      inquiryType: 'Sponsorship Proposal',
      message: 'We want a custom proposal for a Q2 basketball activation with creator coverage.',
      status: 'QUALIFIED' as const,
    },
    {
      name: 'Events Desk',
      organization: 'Metro Sports Hub',
      email: 'events@metrosports.example',
      phone: '09170000002',
      inquiryType: 'On-Ground Activation',
      message: 'Please share event branding and activation options for an upcoming invitational.',
      status: 'UNDER_REVIEW' as const,
    },
  ];

  for (const inquiry of inquiries) {
    const existing = await prisma.inquiry.findFirst({
      where: { email: inquiry.email, inquiryType: inquiry.inquiryType },
    });

    if (existing) {
      await prisma.inquiry.update({ where: { id: existing.id }, data: inquiry });
    } else {
      await prisma.inquiry.create({ data: inquiry });
    }
  }

  const submissions = [
    {
      companyName: 'Northline Nutrition',
      contactName: 'Brand Sponsor',
      email: 'sponsor@resurgence.local',
      phone: '09171230000',
      websiteUrl: 'https://northline.example',
      category: 'Health & Wellness',
      interestedPackage: 'Official Brand Partner',
      budgetRange: 'PHP 75,000–95,000',
      timeline: 'April 2026',
      message: 'We want digital integration plus creator mentions for our launch push.',
      status: SponsorSubmissionStatus.UNDER_REVIEW,
      internalNotes: 'Strong fit for creator integration and digital inventory.',
      sponsorProfileId: sponsorProfile.id,
    },
    {
      companyName: 'Northline Nutrition',
      contactName: 'Brand Sponsor',
      email: 'sponsor@resurgence.local',
      phone: '09171230000',
      websiteUrl: 'https://northline.example',
      category: 'Health & Wellness',
      interestedPackage: 'Major Partner',
      budgetRange: 'PHP 120,000–150,000',
      timeline: 'May 2026',
      message: 'Exploring an upgraded package with stronger on-ground activation and added creator deliverables.',
      status: SponsorSubmissionStatus.NEEDS_REVISION,
      internalNotes: 'Clarify final budget band before approval.',
      sponsorProfileId: sponsorProfile.id,
    },
    {
      companyName: 'Skyline Apparel',
      contactName: 'Marco Dee',
      email: 'marco@skyline.example',
      phone: '09179876543',
      websiteUrl: 'https://skyline.example',
      category: 'Apparel',
      interestedPackage: 'Major Partner',
      budgetRange: 'PHP 120,000–150,000',
      timeline: 'May 2026',
      message: 'Need premium court visibility, creators, and on-ground activation support.',
      status: SponsorSubmissionStatus.APPROVED,
      internalNotes: 'Prepare premium package template and billing schedule.',
      sponsorProfileId: null,
    },
  ];

  for (const submission of submissions) {
    const existing = await prisma.sponsorSubmission.findFirst({ where: { email: submission.email, interestedPackage: submission.interestedPackage } });
    if (existing) {
      await prisma.sponsorSubmission.update({ where: { id: existing.id }, data: submission });
    } else {
      await prisma.sponsorSubmission.create({ data: submission });
    }
  }

  const inquiryRecords = await prisma.inquiry.findMany({ orderBy: { createdAt: 'asc' } });
  const launchInquiry = inquiryRecords.find((item) => item.email === 'launch@velocity.example' && item.inquiryType === 'Sponsorship Proposal');
  const eventsInquiry = inquiryRecords.find((item) => item.email === 'events@metrosports.example' && item.inquiryType === 'On-Ground Activation');

  if (launchInquiry) {
    await prisma.inquiry.update({
      where: { id: launchInquiry.id },
      data: {
        internalNotes: 'Assigned to operations for sponsor proposal follow-up and package scoping.',
        followUpAt: new Date('2026-04-18'),
        assignedStaffProfileId: staffProfile.id,
      },
    });
  }

  if (eventsInquiry) {
    await prisma.inquiry.update({
      where: { id: eventsInquiry.id },
      data: {
        internalNotes: 'Prepare activation footprint options and share venue support checklist.',
        followUpAt: new Date('2026-04-19'),
      },
    });
  }

  const submissionRecords = await prisma.sponsorSubmission.findMany({ orderBy: { createdAt: 'asc' } });
  const northlineOfficialSubmission = submissionRecords.find(
    (item) => item.email === 'sponsor@resurgence.local' && item.interestedPackage === 'Official Brand Partner',
  );
  const skylineSubmission = submissionRecords.find((item) => item.email === 'marco@skyline.example');

  const partnerCampaignSeed = [
    {
      partnerProfileId: partnerProfile.id,
      title: 'Northline Nutrition Co-Branded Push',
      campaignType: 'Brand Amplification',
      status: PartnerCampaignStatus.ACTIVE,
      description: 'Cross-channel collaboration supporting sponsor storytelling, co-branded posts, and partner introductions.',
      startDate: new Date('2026-04-08'),
      endDate: new Date('2026-04-30'),
      contributionValue: 45000,
      assetLink: 'https://drive.example/alliance-campaign-plan',
    },
    {
      partnerProfileId: partnerProfile.id,
      title: 'Community Finals Media Relay',
      campaignType: 'Media Support',
      status: PartnerCampaignStatus.PLANNING,
      description: 'Shared coverage plan for the finals stretch with creator reposts and highlight relay support.',
      startDate: new Date('2026-05-03'),
      endDate: new Date('2026-05-18'),
      contributionValue: 25000,
      assetLink: 'https://drive.example/community-finals-plan',
    },
  ];

  for (const campaign of partnerCampaignSeed) {
    const existing = await prisma.partnerCampaign.findFirst({
      where: { partnerProfileId: campaign.partnerProfileId, title: campaign.title },
    });

    if (existing) {
      await prisma.partnerCampaign.update({ where: { id: existing.id }, data: campaign });
    } else {
      await prisma.partnerCampaign.create({ data: campaign });
    }
  }

  const partnerReferralSeed = [
    {
      partnerProfileId: partnerProfile.id,
      companyName: 'Vertex Hydration',
      contactName: 'Lianne Cruz',
      email: 'lianne@vertex.example',
      phone: '09178881111',
      status: PartnerReferralStatus.QUALIFIED,
      notes: 'Warm lead interested in creator mentions and event booth support.',
      estimatedValue: 90000,
    },
    {
      partnerProfileId: partnerProfile.id,
      companyName: 'Peak Mobility',
      contactName: 'Anton Sy',
      email: 'anton@peakmobility.example',
      phone: '09176662222',
      status: PartnerReferralStatus.CONTACTED,
      notes: 'Awaiting confirmation on activation dates and preferred package level.',
      estimatedValue: 60000,
    },
  ];

  for (const referral of partnerReferralSeed) {
    const existing = await prisma.partnerReferral.findFirst({
      where: { partnerProfileId: referral.partnerProfileId, email: referral.email },
    });

    if (existing) {
      await prisma.partnerReferral.update({ where: { id: existing.id }, data: referral });
    } else {
      await prisma.partnerReferral.create({ data: referral });
    }
  }

  const partnerAgreementSeed = [
    {
      partnerProfileId: partnerProfile.id,
      title: '2026 Collaboration Framework',
      agreementType: 'Master Collaboration Agreement',
      status: AgreementStatus.ACTIVE,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-12-31'),
      documentUrl: 'https://drive.example/2026-collaboration-framework',
      notes: 'Covers referrals, campaign collaboration, and shared asset usage.',
    },
    {
      partnerProfileId: partnerProfile.id,
      title: 'Media Support Addendum',
      agreementType: 'Operational Addendum',
      status: AgreementStatus.DRAFT,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-08-31'),
      documentUrl: 'https://drive.example/media-support-addendum',
      notes: 'Pending sign-off from both commercial teams.',
    },
  ];

  for (const agreement of partnerAgreementSeed) {
    const existing = await prisma.partnerAgreement.findFirst({
      where: { partnerProfileId: agreement.partnerProfileId, title: agreement.title },
    });

    if (existing) {
      await prisma.partnerAgreement.update({ where: { id: existing.id }, data: agreement });
    } else {
      await prisma.partnerAgreement.create({ data: agreement });
    }
  }

  const staffTaskSeed = [
    {
      staffProfileId: staffProfile.id,
      title: 'Prepare velocity proposal draft',
      description: 'Build a sponsor-ready draft using the Official Brand Partner template and creator options.',
      priority: StaffTaskPriority.HIGH,
      status: StaffTaskStatus.IN_PROGRESS,
      dueDate: new Date('2026-04-18'),
      inquiryId: launchInquiry?.id || null,
      sponsorSubmissionId: northlineOfficialSubmission?.id || null,
      completedAt: null,
    },
    {
      staffProfileId: staffProfile.id,
      title: 'Confirm finals activation checklist',
      description: 'Coordinate venue dimensions, booth needs, and sponsor visibility points for on-ground activation.',
      priority: StaffTaskPriority.NORMAL,
      status: StaffTaskStatus.TODO,
      dueDate: new Date('2026-04-20'),
      inquiryId: eventsInquiry?.id || null,
      sponsorSubmissionId: skylineSubmission?.id || null,
      completedAt: null,
    },
  ];

  for (const task of staffTaskSeed) {
    const existing = await prisma.staffTask.findFirst({
      where: { staffProfileId: task.staffProfileId, title: task.title },
    });

    if (existing) {
      await prisma.staffTask.update({ where: { id: existing.id }, data: task });
    } else {
      await prisma.staffTask.create({ data: task });
    }
  }

  const staffScheduleSeed = [
    {
      staffProfileId: staffProfile.id,
      title: 'Northline sponsor review call',
      location: 'Google Meet',
      startAt: new Date('2026-04-17T10:00:00+08:00'),
      endAt: new Date('2026-04-17T11:00:00+08:00'),
      notes: 'Review updated digital integration deliverables.',
    },
    {
      staffProfileId: staffProfile.id,
      title: 'Venue walkthrough for activation',
      location: 'Metro Sports Hub',
      startAt: new Date('2026-04-19T14:00:00+08:00'),
      endAt: new Date('2026-04-19T15:30:00+08:00'),
      notes: 'Capture booth spacing and sponsor signage locations.',
    },
  ];

  for (const scheduleItem of staffScheduleSeed) {
    const existing = await prisma.staffScheduleItem.findFirst({
      where: { staffProfileId: scheduleItem.staffProfileId, title: scheduleItem.title },
    });

    if (existing) {
      await prisma.staffScheduleItem.update({ where: { id: existing.id }, data: scheduleItem });
    } else {
      await prisma.staffScheduleItem.create({ data: scheduleItem });
    }
  }

  const staffAnnouncementSeed = [
    {
      staffProfileId: staffProfile.id,
      title: 'Sponsor review week',
      body: 'Prioritize proposal turnarounds, update inquiry notes daily, and keep sponsor-facing deliverables current.',
      level: AnnouncementLevel.INFO,
      isPinned: true,
      publishAt: new Date('2026-04-16T08:00:00+08:00'),
    },
    {
      staffProfileId: staffProfile.id,
      title: 'Activation assets due Friday',
      body: 'Collect booth requirements, logo packs, and venue confirmations before end of day Friday.',
      level: AnnouncementLevel.WARNING,
      isPinned: false,
      publishAt: new Date('2026-04-17T09:00:00+08:00'),
    },
  ];

  for (const announcement of staffAnnouncementSeed) {
    const existing = await prisma.staffAnnouncement.findFirst({
      where: { staffProfileId: announcement.staffProfileId, title: announcement.title },
    });

    if (existing) {
      await prisma.staffAnnouncement.update({ where: { id: existing.id }, data: announcement });
    } else {
      await prisma.staffAnnouncement.create({ data: announcement });
    }
  }

  const deliverables = [
    {
      sponsorProfileId: sponsorProfile.id,
      title: 'Logo files and brand kit submission',
      category: 'Branding Assets',
      status: DeliverableStatus.SUBMITTED,
      dueDate: new Date('2026-04-15'),
      assetLink: 'https://drive.example/northline-logo-pack',
      sponsorNotes: 'Uploaded primary and secondary logo files with color references.',
      adminNotes: 'Awaiting final confirmation from creative lead.',
    },
    {
      sponsorProfileId: sponsorProfile.id,
      title: 'Creator mention storyboard approval',
      category: 'Digital Integration',
      status: DeliverableStatus.IN_PROGRESS,
      dueDate: new Date('2026-04-20'),
      assetLink: 'https://drive.example/northline-storyboard',
      sponsorNotes: 'Need one more review pass on brand tone and product claims.',
      adminNotes: 'Pending revised caption set.',
    },
    {
      sponsorProfileId: sponsorProfile.id,
      title: 'Event booth requirement checklist',
      category: 'On-Ground Activation',
      status: DeliverableStatus.PENDING,
      dueDate: new Date('2026-04-25'),
      assetLink: '',
      sponsorNotes: 'Waiting for final venue dimensions.',
      adminNotes: 'Operations to share event map.',
    },
  ];

  for (const deliverable of deliverables) {
    const existing = await prisma.sponsorDeliverable.findFirst({ where: { sponsorProfileId: deliverable.sponsorProfileId, title: deliverable.title } });
    if (existing) {
      await prisma.sponsorDeliverable.update({ where: { id: existing.id }, data: deliverable });
    } else {
      await prisma.sponsorDeliverable.create({ data: deliverable });
    }
  }

  const invoiceSeed = [
    {
      invoiceNumber: 'INV-202604-0001',
      companyName: 'Northline Nutrition',
      contactName: 'Brand Sponsor',
      email: 'sponsor@resurgence.local',
      tier: 'Official Brand Partner',
      description: 'Initial sponsor billing for digital integration, creator callouts, and partner assets.',
      amount: 85000,
      balanceAmount: 25000,
      status: InvoiceStatus.PARTIALLY_PAID,
      issueDate: new Date('2026-04-03'),
      dueDate: new Date('2026-04-12'),
      notes: 'Partial payment received. Remaining balance under review.',
      sponsorId: northlineSponsor?.id,
    },
    {
      invoiceNumber: 'INV-202604-0002',
      companyName: 'Skyline Apparel',
      contactName: 'Marco Dee',
      email: 'marco@skyline.example',
      tier: 'Major Partner',
      description: 'Major partner billing for premium activation and creator integration.',
      amount: 120000,
      balanceAmount: 120000,
      status: InvoiceStatus.ISSUED,
      issueDate: new Date('2026-04-05'),
      dueDate: new Date('2026-04-20'),
      notes: 'Awaiting sponsor remittance.',
      sponsorId: sponsorRecords.find((item) => item.slug === 'skyline-apparel')?.id,
    },
    {
      invoiceNumber: 'INV-202604-0003',
      companyName: 'Community Fuel Cafe',
      contactName: 'Cafe Owner',
      email: 'owner@communityfuel.example',
      tier: 'Supporting Sponsor',
      description: 'Supporting sponsor billing for grassroots event visibility.',
      amount: 15000,
      balanceAmount: 0,
      status: InvoiceStatus.PAID,
      issueDate: new Date('2026-04-01'),
      dueDate: new Date('2026-04-08'),
      notes: 'Settled via bank transfer.',
      sponsorId: sponsorRecords.find((item) => item.slug === 'community-fuel-cafe')?.id,
    },
    {
      invoiceNumber: 'INV-202604-0004',
      companyName: 'Apex Telecom',
      contactName: 'Campaign Owner',
      email: 'campaigns@apextelecom.example',
      tier: 'Event Presenting',
      description: 'Headline event presenting package with custom activation stack.',
      amount: 180000,
      balanceAmount: 180000,
      status: InvoiceStatus.OVERDUE,
      issueDate: new Date('2026-03-20'),
      dueDate: new Date('2026-03-30'),
      notes: 'Escalate for follow-up and payment collection.',
      sponsorId: sponsorRecords.find((item) => item.slug === 'apex-telecom')?.id,
    },
  ];

  for (const invoice of invoiceSeed) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: invoice.invoiceNumber },
      update: invoice,
      create: invoice,
    });
  }

  const invoices = await prisma.invoice.findMany({ orderBy: { invoiceNumber: 'asc' } });

  const transactionSeed = [
    {
      transactionNumber: 'TXN-202604-0001',
      invoiceId: invoices.find((item) => item.invoiceNumber === 'INV-202604-0001')?.id,
      companyName: 'Northline Nutrition',
      description: 'Initial collection for official brand partner package.',
      amount: 60000,
      kind: CashierTransactionKind.COLLECTION,
      paymentMethod: PaymentMethod.GCASH,
      referenceNumber: 'GCASH-449221',
      transactionDate: new Date('2026-04-06'),
      notes: 'Partial collection recorded.',
    },
    {
      transactionNumber: 'TXN-202604-0002',
      invoiceId: invoices.find((item) => item.invoiceNumber === 'INV-202604-0001')?.id,
      companyName: 'Northline Nutrition',
      description: 'Refund correction for duplicate sponsor payment posting.',
      amount: 5000,
      kind: CashierTransactionKind.REFUND,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      referenceNumber: 'REV-22001',
      transactionDate: new Date('2026-04-07'),
      notes: 'Backed out duplicated bank posting.',
    },
    {
      transactionNumber: 'TXN-202604-0003',
      invoiceId: invoices.find((item) => item.invoiceNumber === 'INV-202604-0002')?.id,
      companyName: 'Skyline Apparel',
      description: 'Internal adjustment tied to revised billing schedule.',
      amount: 10000,
      kind: CashierTransactionKind.ADJUSTMENT,
      paymentMethod: PaymentMethod.OTHER,
      referenceNumber: 'ADJ-0001',
      transactionDate: new Date('2026-04-08'),
      notes: 'Non-cash adjustment for internal audit trail.',
    },
    {
      transactionNumber: 'TXN-202604-0004',
      invoiceId: invoices.find((item) => item.invoiceNumber === 'INV-202604-0003')?.id,
      companyName: 'Community Fuel Cafe',
      description: 'Full collection for supporting sponsor invoice.',
      amount: 15000,
      kind: CashierTransactionKind.COLLECTION,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      referenceNumber: 'BDO-834921',
      transactionDate: new Date('2026-04-02'),
      notes: 'Confirmed by finance desk.',
    },
  ];

  for (const transaction of transactionSeed) {
    await prisma.cashierTransaction.upsert({
      where: { transactionNumber: transaction.transactionNumber },
      update: transaction,
      create: transaction,
    });
  }

  for (const invoice of invoices) {
    const linkedTransactions = await prisma.cashierTransaction.findMany({ where: { invoiceId: invoice.id } });
    const collections = linkedTransactions.filter((item) => item.kind === CashierTransactionKind.COLLECTION).reduce((sum, item) => sum + item.amount, 0);
    const refunds = linkedTransactions.filter((item) => item.kind === CashierTransactionKind.REFUND).reduce((sum, item) => sum + item.amount, 0);
    const paid = collections - refunds;
    const balanceAmount = Math.max(invoice.amount - paid, 0);
    const status = balanceAmount <= 0 ? InvoiceStatus.PAID : balanceAmount < invoice.amount ? InvoiceStatus.PARTIALLY_PAID : invoice.status;
    await prisma.invoice.update({ where: { id: invoice.id }, data: { balanceAmount, status } });
  }

  const transactions = await prisma.cashierTransaction.findMany({ orderBy: { transactionNumber: 'asc' } });

  const receiptSeed = [
    {
      receiptNumber: 'OR-202604-0001',
      invoiceId: invoices.find((item) => item.invoiceNumber === 'INV-202604-0001')?.id,
      transactionId: transactions.find((item) => item.transactionNumber === 'TXN-202604-0001')?.id,
      companyName: 'Northline Nutrition',
      receivedFrom: 'Brand Sponsor',
      amount: 60000,
      paymentMethod: PaymentMethod.GCASH,
      issuedAt: new Date('2026-04-06'),
      notes: 'Receipt for initial Northline collection.',
    },
    {
      receiptNumber: 'OR-202604-0002',
      invoiceId: invoices.find((item) => item.invoiceNumber === 'INV-202604-0003')?.id,
      transactionId: transactions.find((item) => item.transactionNumber === 'TXN-202604-0004')?.id,
      companyName: 'Community Fuel Cafe',
      receivedFrom: 'Cafe Owner',
      amount: 15000,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      issuedAt: new Date('2026-04-02'),
      notes: 'Official receipt issued after full settlement.',
    },
  ];

  for (const receipt of receiptSeed) {
    await prisma.receipt.upsert({
      where: { receiptNumber: receipt.receiptNumber },
      update: receipt,
      create: receipt,
    });
  }

  const receipts = await prisma.receipt.findMany({ orderBy: { receiptNumber: 'asc' } });

  const settingSeed = [
    { key: 'contactName', value: process.env.NEXT_PUBLIC_CONTACT_NAME || 'Jake Anilao', label: 'Contact name', group: 'contact' },
    { key: 'contactEmail', value: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'resurgence.dx@gmail.com', label: 'Contact email', group: 'contact' },
    { key: 'contactPhone', value: process.env.NEXT_PUBLIC_CONTACT_PHONE || '09387841636', label: 'Contact phone', group: 'contact' },
    { key: 'contactAddress', value: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Official business address to follow', label: 'Contact address', group: 'contact' },
    { key: 'adminTitle', value: 'RESURGENCE Admin', label: 'Admin title', group: 'admin' },
    { key: 'adminSubtitle', value: '2026 Sponsorship Operations', label: 'Admin subtitle', group: 'admin' },
    { key: 'reportFooter', value: 'RESURGENCE Powered by DesignXpress', label: 'Report footer', group: 'admin' },
  ];

  for (const setting of settingSeed) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }

  const reportPayload = JSON.stringify({
    title: 'Seeded System Admin Snapshot',
    generatedAt: new Date('2026-04-11T00:00:00.000Z').toISOString(),
    metrics: {
      sponsors: sponsors.length,
      partners: partners.length,
      creators: creatorNetwork.length,
      inventoryCategories: sponsorInventoryCategories.length,
      packageTemplates: sponsorPackageTemplates.length,
      services: serviceSeed.length,
      galleryEvents: gallerySeed.length,
    },
  }, null, 2);

  const existingReport = await prisma.adminReport.findFirst({ where: { title: 'Seeded System Admin Snapshot' } });
  const seededReport = existingReport
    ? await prisma.adminReport.update({
      where: { id: existingReport.id },
      data: {
        reportType: 'SYSTEM_ADMIN',
        summary: 'Initial seeded report snapshot for System Admin testing.',
        payloadJson: reportPayload,
        generatedByEmail: 'admin@resurgence.local',
      },
    })
    : await prisma.adminReport.create({
      data: {
        title: 'Seeded System Admin Snapshot',
        reportType: 'SYSTEM_ADMIN',
        summary: 'Initial seeded report snapshot for System Admin testing.',
        payloadJson: reportPayload,
        generatedByEmail: 'admin@resurgence.local',
      },
    });

  const adminUser = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@resurgence.local' } });
  const cashierUser = await prisma.user.findUniqueOrThrow({ where: { email: 'cashier@resurgence.local' } });

  const notificationSeed = [
    {
      recipientRole: UserRole.SYSTEM_ADMIN,
      recipientUserId: adminUser.id,
      title: 'Daily executive snapshot ready',
      message: 'The seeded admin analytics snapshot is available for export and printing.',
      level: AnnouncementLevel.INFO,
      href: '/admin/reports',
    },
    {
      recipientRole: UserRole.CASHIER,
      recipientUserId: cashierUser.id,
      title: 'Finance exports are available',
      message: 'Use the cashier reports page to export invoices, transactions, receipts, and summary datasets.',
      level: AnnouncementLevel.SUCCESS,
      href: '/cashier/reports',
    },
    {
      recipientRole: UserRole.SPONSOR,
      recipientUserId: sponsorUser.id,
      title: 'Sponsor billing update',
      message: 'New invoice and receipt demo records were seeded for end-to-end portal testing.',
      level: AnnouncementLevel.INFO,
      href: '/sponsor/billing',
    },
  ];

  for (const item of notificationSeed) {
    const existing = await prisma.platformNotification.findFirst({
      where: { recipientUserId: item.recipientUserId, title: item.title },
    });

    if (existing) {
      await prisma.platformNotification.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.platformNotification.create({ data: item });
    }
  }

  const emailSeed = [
    {
      recipientRole: UserRole.SYSTEM_ADMIN,
      recipientUserId: adminUser.id,
      toEmail: 'admin@resurgence.local',
      toName: 'System Administrator',
      subject: 'Seeded admin reporting digest',
      bodyText: 'This demo email record represents an automated executive summary dispatch for the platform.',
      eventKey: 'seed.admin.digest',
      relatedType: 'AdminReport',
      relatedId: seededReport.id,
      status: EmailAutomationStatus.SKIPPED,
      errorMessage: 'EMAIL_WEBHOOK_URL is not configured in the seeded environment.',
    },
    {
      recipientRole: UserRole.CASHIER,
      recipientUserId: cashierUser.id,
      toEmail: 'cashier@resurgence.local',
      toName: 'Finance Cashier',
      subject: 'Seeded finance export reminder',
      bodyText: 'This demo email record represents a scheduled cashier export workflow reminder.',
      eventKey: 'seed.cashier.reminder',
      relatedType: 'Invoice',
      relatedId: invoices[0]?.id || null,
      status: EmailAutomationStatus.SKIPPED,
      errorMessage: 'EMAIL_WEBHOOK_URL is not configured in the seeded environment.',
    },
    {
      recipientRole: UserRole.SPONSOR,
      recipientUserId: sponsorUser.id,
      toEmail: 'sponsor@resurgence.local',
      toName: 'Northline Nutrition',
      subject: 'Seeded sponsor receipt notification',
      bodyText: 'This demo email record represents an automated sponsor receipt confirmation.',
      eventKey: 'seed.sponsor.receipt',
      relatedType: 'Receipt',
      relatedId: receipts[0]?.id || null,
      status: EmailAutomationStatus.SKIPPED,
      errorMessage: 'EMAIL_WEBHOOK_URL is not configured in the seeded environment.',
    },
  ];

  for (const item of emailSeed) {
    const existing = await prisma.automatedEmail.findFirst({
      where: { toEmail: item.toEmail, eventKey: item.eventKey },
    });

    if (existing) {
      await prisma.automatedEmail.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.automatedEmail.create({ data: item });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
