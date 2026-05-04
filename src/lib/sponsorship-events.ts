export type SponsorshipEventConfig = {
  slug: string;
  title: string;
  shortTitle: string;
  organizer: string;
  market: string;
  eventDate: string;
  category: string;
  heroKicker: string;
  heroSubtitle: string;
  overviewTitle: string;
  overviewCopy: string;
  objectives: string[];
};

const dayoEvent: SponsorshipEventConfig = {
  slug: 'dayo-series-ofw-all-star',
  title: 'DAYO Series OFW All-Star 2026',
  shortTitle: 'DAYO Series',
  organizer: 'AMMOS 2014 Hong Kong',
  market: 'Hong Kong & Macau',
  eventDate: '',
  category: 'DAYO Series',
  heroKicker: 'AMMOS 2014 Hong Kong Presents',
  heroSubtitle: 'Comprehensive sponsorship and team presentation for one court, one dream, and one champion.',
  overviewTitle: 'OFW basketball community activation',
  overviewCopy:
    'DAYO Series OFW All-Star 2026 positions basketball as a cultural bridge for Filipino workers, athletes, families, and sponsor brands across Hong Kong and Macau.',
  objectives: [
    'Unite OFW basketball communities through a premium all-star event.',
    'Create sponsor-ready exposure across teams, jerseys, courtside assets, and content.',
    'Build a repeatable sports activation model for RESURGENCE partners.',
  ],
};

export const sponsorshipEvents: SponsorshipEventConfig[] = [dayoEvent];

export function getSponsorshipEvent(slug: string) {
  return sponsorshipEvents.find((event) => event.slug === slug) || null;
}

export function getDefaultSponsorshipEvent() {
  return dayoEvent;
}
