export const sponsorshipStats = {
  combinedFollowers: '2.15M+',
  activePlatforms: '2',
  creatorCount: '6',
};

export const creatorNetwork = [
  {
    name: 'Jake Anilao',
    slug: 'jake-anilao',
    role: 'Founder / Lead Face of RESURGENCE',
    platformFocus: 'Basketball leadership, community activation, sponsor storytelling',
    audience: 'High-trust sports and grassroots community reach',
    biography: 'Jake leads RESURGENCE as a founder, organizer, and on-camera personality who connects sponsor storytelling with real basketball communities.',
    journeyStory: 'From community-first basketball initiatives to brand-led campaigns, Jake built RESURGENCE to turn sports culture into structured sponsorship value.',
    pointsPerGame: 18.4,
    assistsPerGame: 7.2,
    reboundsPerGame: 6.1,
    imageUrl: '/assets/resurgence-poster.jpg',
  },
  {
    name: 'Gab Dimalanta',
    slug: 'gab-dimalanta',
    role: 'Creator Athlete',
    platformFocus: 'Basketball content, athlete lifestyle, branded integrations',
    audience: 'Performance-driven sports viewers',
    biography: 'Gab blends athlete performance, training content, and authentic partner integrations for sports-first audiences.',
    journeyStory: 'His journey grew from competitive basketball content into a creator-athlete role trusted by both community audiences and brand partners.',
    pointsPerGame: 16.8,
    assistsPerGame: 4.9,
    reboundsPerGame: 5.3,
    imageUrl: '/assets/resurgence-logo.jpg',
  },
  {
    name: 'KlengTV',
    slug: 'klengtv',
    role: 'Entertainment Creator',
    platformFocus: 'Lifestyle and audience engagement campaigns',
    audience: 'High-engagement mainstream digital audience',
    biography: 'KlengTV adds reach, humor, and mainstream audience energy to campaigns that need broad digital engagement.',
    journeyStory: 'What started as highly relatable digital content evolved into creator-led storytelling that expands the RESURGENCE audience beyond sports-only viewers.',
    pointsPerGame: 11.2,
    assistsPerGame: 3.8,
    reboundsPerGame: 4.0,
    imageUrl: '/assets/resurgence-poster.jpg',
  },
  {
    name: 'Macofacundo',
    slug: 'macofacundo',
    role: 'Community Creator',
    platformFocus: 'Street-level activation and creator-led promotions',
    audience: 'Community-first basketball audience',
    biography: 'Macofacundo focuses on community-driven basketball content that converts grassroots attention into event energy.',
    journeyStory: 'By staying close to community courts and local audiences, Macofacundo became a reliable creator for authentic ground-up brand exposure.',
    pointsPerGame: 13.5,
    assistsPerGame: 5.1,
    reboundsPerGame: 6.7,
    imageUrl: '/assets/resurgence-logo.jpg',
  },
  {
    name: 'Angelo H. Deciembre',
    slug: 'angelo-h-deciembre',
    role: 'Sports Personality',
    platformFocus: 'Brand awareness and partnership storytelling',
    audience: 'Credibility-based sports audience reach',
    biography: 'Angelo adds credibility, sports storytelling, and personality-led audience trust across campaigns and brand messages.',
    journeyStory: 'His evolution from sports personality to campaign storyteller gives RESURGENCE a strong voice in partnership communication and event narratives.',
    pointsPerGame: 14.1,
    assistsPerGame: 6.0,
    reboundsPerGame: 5.8,
    imageUrl: '/assets/resurgence-poster.jpg',
  },
  {
    name: 'Klint Almine',
    slug: 'klint-almine',
    role: 'Emerging Creator',
    platformFocus: 'Digital growth, campaign support, branded content execution',
    audience: 'High-potential creator engagement segment',
    biography: 'Klint represents the next wave of creator talent focused on support roles, campaign execution, and digital growth.',
    journeyStory: 'From supporting content operations to building his own recognizable presence, Klint’s story reflects the platform’s commitment to rising talent.',
    pointsPerGame: 10.4,
    assistsPerGame: 4.4,
    reboundsPerGame: 4.9,
    imageUrl: '/assets/resurgence-logo.jpg',
  },
] as const;

export const sponsorInventoryCategories = [
  {
    name: 'Branding Assets',
    description: 'Jersey placement, event signage, posters, branded merchandise, and physical visibility assets.',
    examples: ['Jersey logo placement', 'Backdrop and LED signage', 'Poster and event collateral'],
  },
  {
    name: 'Digital Integration',
    description: 'Creator-led posts, reels, social mentions, package callouts, and lead-generation content.',
    examples: ['Reels and short-form videos', 'Social posting inclusion', 'Lead capture integrations'],
  },
  {
    name: 'On-Ground Activation',
    description: 'Venue activations, experiential booths, live mentions, and game-day sponsor exposure.',
    examples: ['Booth presence', 'Live acknowledgements', 'Sampling and activation space'],
  },
  {
    name: 'Commercial Support',
    description: 'Proposal customizations, package structuring, brand alignment, and commercial delivery support.',
    examples: ['Tailored proposal support', 'Activation planning', 'Commercial coordination'],
  },
] as const;

export const sponsorPackageTemplates = [
  {
    name: 'Supporting Sponsor',
    tier: 'Supporting Sponsor',
    value: 'PHP 15,000–50,000',
    rangeLabel: 'PHP 15,000–50,000',
    summary: 'Entry sponsorship tier designed for visibility, community support, and targeted activation value.',
    benefits: [
      'Logo placement on selected event and digital assets',
      'Inclusion in sponsor recognition materials',
      'Visibility across select social and event mentions',
      'Access to structured grassroots brand exposure',
    ],
  },
  {
    name: 'Official Brand Partner',
    tier: 'Official Brand Partner',
    value: 'PHP 75,000–95,000',
    rangeLabel: 'PHP 75,000–95,000',
    summary: 'Mid-tier brand partnership with stronger digital integration and broader sponsorship positioning.',
    benefits: [
      'Enhanced brand placement across sponsor-facing materials',
      'Digital integration across creator and campaign assets',
      'Expanded event visibility and partner callouts',
      'Priority inclusion in activation planning',
    ],
  },
  {
    name: 'Major Partner',
    tier: 'Major Partner',
    value: 'PHP 120,000–150,000',
    rangeLabel: 'PHP 120,000–150,000',
    summary: 'High-impact partnership tier for brands seeking premium integration and strong commercial presence.',
    benefits: [
      'Premium logo placement and sponsor positioning',
      'Expanded creator-network integration',
      'On-ground activation prioritization',
      'High-visibility commercial support and packaged deliverables',
    ],
  },
  {
    name: 'Event Presenting',
    tier: 'Event Presenting',
    value: 'Custom Proposal',
    rangeLabel: 'Custom Proposal',
    summary: 'Custom presenting package for lead brands seeking headline integration and tailored sponsorship rights.',
    benefits: [
      'Custom proposal structure based on event or campaign scale',
      'Presenting-level brand integration',
      'Priority negotiation on activations and deck placement',
      'Tailored deliverables, branding, and commercial support',
    ],
  },
] as const;

export const roleMeta = {
  SYSTEM_ADMIN: {
    label: 'System Admin',
    defaultRoute: '/admin',
    accent: '2026 sponsorship operations',
  },
  CASHIER: {
    label: 'Cashier',
    defaultRoute: '/cashier',
    accent: 'billing, receipts, and collections',
  },
  SPONSOR: {
    label: 'Sponsor',
    defaultRoute: '/sponsor/dashboard',
    accent: 'package visibility and deliverables',
  },
  STAFF: {
    label: 'Staff',
    defaultRoute: '/staff',
    accent: 'coordination and inquiry workflow',
  },
  PARTNER: {
    label: 'Partner',
    defaultRoute: '/partner',
    accent: 'campaigns, referrals, and agreements',
  },
} as const;

export const rolePrefixes = {
  SYSTEM_ADMIN: ['/admin'],
  CASHIER: ['/cashier'],
  SPONSOR: ['/sponsor/dashboard', '/sponsor/applications', '/sponsor/packages', '/sponsor/deliverables', '/sponsor/billing', '/sponsor/profile'],
  STAFF: ['/staff'],
  PARTNER: ['/partner'],
} as const;

export type AppRole = keyof typeof roleMeta;
