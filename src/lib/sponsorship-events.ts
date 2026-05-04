export type SponsorshipEventScheduleItem = {
  id: string;
  label: string;
  date?: string | null;
  time?: string | null;
  venue?: string | null;
  location?: string | null;
  description?: string | null;
};

export type SponsorshipEventPackage = {
  id: string;
  name: string;
  slug: string;
  priceLabel: string;
  summary: string;
  benefits: string[];
  isFeatured?: boolean;
};

export type SponsorshipEvent = {
  id: string;
  slug: string;
  eyebrow: string;
  heroKicker: string;
  title: string;
  subtitle: string;
  heroSubtitle: string;
  summary: string;
  overviewTitle: string;
  overviewSummary: string;
  overviewCopy: string;
  objectives: string[];
  organizer: string;
  market: string;
  venue?: string | null;
  eventDate?: string | null;
  scheduleLabel: string;
  status: 'COMING_SOON' | 'OPEN' | 'ACTIVE' | 'CLOSED';
  packages: SponsorshipEventPackage[];
  schedule: SponsorshipEventScheduleItem[];
};

export const sponsorshipEvents: SponsorshipEvent[] = [
  {
    id: 'dayo-series-ofw-all-star',
    slug: 'dayo-series-ofw-all-star',
    eyebrow: 'AMMOS 2014 Hong Kong Presents',
    heroKicker: 'AMMOS 2014 Hong Kong Presents',
    title: 'DAYO Series OFW All-Star 2026',
    subtitle: 'One court. One dream. One champion.',
    heroSubtitle:
      'Comprehensive sponsorship and team presentation for one court, one dream, and one champion.',
    summary:
      'Comprehensive sponsorship and team presentation for OFW basketball, creator visibility, and brand activation across Hong Kong and Macau.',
    overviewTitle: 'Hong Kong and Macau OFW basketball sponsorship platform',
    overviewSummary:
      'A sponsorship-ready event experience built for basketball visibility, creator-powered reach, team presentation, community engagement, and commercial brand activation.',
    overviewCopy:
      'This event creates a premium OFW basketball platform where sponsors can connect with community audiences, creator-led storytelling, event-day visibility, and structured brand activation opportunities across Hong Kong and Macau.',
    objectives: [
      'Build a premium OFW basketball sponsorship platform',
      'Connect brands with community sports audiences',
      'Create creator-powered visibility before and after event day',
      'Support structured sponsor activations and commercial deliverables',
    ],
    organizer: 'AMMOS 2014 Hong Kong',
    market: 'Hong Kong & Macau',
    venue: null,
    eventDate: null,
    scheduleLabel: 'Coming Soon',
    status: 'COMING_SOON',
    packages: [
      {
        id: 'supporting-sponsor',
        name: 'Supporting Sponsor',
        slug: 'supporting-sponsor',
        priceLabel: 'PHP 15,000-50,000',
        summary:
          'Entry sponsorship tier designed for visibility, community support, and targeted activation value.',
        benefits: [
          'Logo placement on selected event and digital assets',
          'Inclusion in sponsor recognition materials',
          'Visibility across select social and event mentions',
          'Access to structured grassroots brand exposure',
        ],
      },
      {
        id: 'official-brand-partner',
        name: 'Official Brand Partner',
        slug: 'official-brand-partner',
        priceLabel: 'PHP 75,000-95,000',
        summary:
          'Mid-tier brand partnership with stronger digital integration and broader sponsorship positioning.',
        benefits: [
          'Enhanced brand placement across sponsor-facing materials',
          'Digital integration across creator and campaign assets',
          'Expanded event visibility and partner callouts',
          'Priority inclusion in activation planning',
        ],
        isFeatured: true,
      },
      {
        id: 'major-partner',
        name: 'Major Partner',
        slug: 'major-partner',
        priceLabel: 'PHP 120,000-150,000',
        summary:
          'High-impact partnership tier for brands seeking premium integration and strong commercial presence.',
        benefits: [
          'Premium logo placement and sponsor positioning',
          'Expanded creator-network integration',
          'On-ground activation prioritization',
          'High-visibility commercial support and packaged deliverables',
        ],
      },
      {
        id: 'event-presenting',
        name: 'Event Presenting',
        slug: 'event-presenting',
        priceLabel: 'Custom Proposal',
        summary:
          'Custom presenting package for lead brands seeking headline integration and tailored sponsorship rights.',
        benefits: [
          'Custom proposal structure based on event or campaign scale',
          'Presenting-level brand integration',
          'Priority negotiation on activations and deck placement',
          'Tailored deliverables, branding, and commercial support',
        ],
      },
    ],
    schedule: [],
  },
];

export function getDefaultSponsorshipEvent() {
  return sponsorshipEvents[0];
}

export function getSponsorshipEvent(slug?: string | null) {
  if (!slug) return getDefaultSponsorshipEvent();

  return (
    sponsorshipEvents.find((event) => event.slug === slug || event.id === slug) ||
    getDefaultSponsorshipEvent()
  );
}

export function getSponsorshipEventScheduleLabel(event: SponsorshipEvent) {
  if (event.eventDate) return event.eventDate;

  if (event.schedule.length > 0) {
    return event.schedule[0]?.label || event.scheduleLabel;
  }

  return event.scheduleLabel || 'Coming Soon';
}

export function getEventScheduleLabel(event: SponsorshipEvent) {
  return getSponsorshipEventScheduleLabel(event);
}

export function hasSponsorshipEventSchedule(event: SponsorshipEvent) {
  return Boolean(event.eventDate || event.schedule.length > 0);
}
