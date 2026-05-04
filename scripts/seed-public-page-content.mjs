import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pageContentSeeds = [
  {
    key: 'events.hero',
    title: 'Sponsorship-ready events, community activations, and creator moments.',
    body:
      'Explore official RESURGENCE event pages, review sponsorship opportunities, and apply for packages connected to each activation. Built for basketball communities, brand partners, creators, and event organizers who need one premium activation hub.',
    ctaLabel: 'View Sponsor Packages',
    ctaHref: '/sponsors',
  },
  {
    key: 'events.overview',
    title: 'Choose an event to open its sponsor landing page.',
    body:
      'Official RESURGENCE event pages connect sponsors, creators, basketball communities, team operations, media visibility, and activation opportunities. Each event can carry its own schedule, package offers, CRM pipeline, and sponsor application route.',
    ctaLabel: 'Open Events',
    ctaHref: '/events',
  },
  {
    key: 'events.sponsorCta',
    title: 'Sponsor the next RESURGENCE activation.',
    body:
      'Put your brand in front of engaged basketball communities, creator audiences, and event-day participants through structured sponsor packages and activation deliverables.',
    ctaLabel: 'Apply as Sponsor',
    ctaHref: '/events/dayo-series-ofw-all-star/apply',
  },
  {
    key: 'events.emptyState',
    title: 'More events are coming soon.',
    body:
      'New RESURGENCE event pages will appear here when schedules, packages, and sponsor application links are ready.',
    ctaLabel: 'Contact Events Team',
    ctaHref: '/contact',
  },
  {
    key: 'partnerships.hero',
    title: 'Build partnerships that connect brands, creators, merch, and community sports.',
    body:
      'RESURGENCE Powered by DesignXpress gives sponsors, partners, affiliates, creators, merchants, and community organizers a structured business entry point for collaborations. Use this page for sponsorships, co-branded campaigns, referral programs, custom apparel, event activations, and long-term commercial opportunities.',
    ctaLabel: 'Start Partnership Inquiry',
    ctaHref: '/contact',
  },
  {
    key: 'partnerships.paths',
    title: 'Choose the partnership route that fits your business goal.',
    body:
      'Route sponsorships, referrals, branded apparel programs, creator collaborations, media partnerships, and larger commercial opportunities into the right workflow. Every inquiry is designed to separate customer support from business development so the right team can respond faster.',
    ctaLabel: 'View Sponsor Packages',
    ctaHref: '/sponsors',
  },
  {
    key: 'partnerships.businessContact',
    title: 'Official partnership routing.',
    body:
      'Partnership conversations are routed through the business team for sponsorships, affiliates, referrals, co-branded programs, media collaboration, and custom commercial opportunities.',
    ctaLabel: 'Email Partnerships',
    ctaHref: 'mailto:partnerships@resurgence-dx.biz',
  },
  {
    key: 'support.hero',
    title: 'Live support desk for RESURGENCE customers, sponsors, creators, and partners.',
    body:
      'Get help with sponsorships, shop orders, payments, basketball events, custom apparel, creator activity, partnerships, and human follow-up. The support desk uses official business details and routes approval-sensitive requests to the right team.',
    ctaLabel: 'Email Support',
    ctaHref: 'mailto:support@resurgence-dx.biz',
  },
  {
    key: 'support.routing',
    title: 'Comprehensive help topics with accurate handoff rules.',
    body:
      'Support routes visitors into the right workflow for sponsorships, shop orders, payments, events, custom apparel, creator questions, partnership inquiries, and general platform help. Requests that need pricing, inventory, delivery, approval, or contract confirmation are escalated to human follow-up.',
    ctaLabel: 'Open Support Desk',
    ctaHref: '/support',
  },
  {
    key: 'support.rules',
    title: 'Accurate answers, safe routing, and clear next steps.',
    body:
      'RESURGENCE support should use only confirmed business information, avoid inventing prices or commitments, protect payment privacy, and collect complete contact details when a request needs review. Human follow-up should confirm custom pricing, delivery timelines, sponsorship terms, stock availability, and approvals.',
    ctaLabel: 'Contact Support',
    ctaHref: '/contact',
  },
  {
    key: 'support.formIntro',
    title: 'Need a proposal, quotation, order follow-up, or callback?',
    body:
      'Submit your details when your request needs admin review, pricing confirmation, order support, production planning, or scheduled human response.',
    ctaLabel: 'Submit Inquiry',
    ctaHref: '/contact',
  },
  {
    key: 'support.aiPromptIntro',
    title: 'Official support assistant workflow.',
    body:
      'The RESURGENCE support assistant should answer with confirmed business facts, route complex requests to human follow-up, and avoid making unapproved promises.',
    ctaLabel: 'Open Support',
    ctaHref: '/support',
  },
  {
    key: 'home.discovery.resurgence',
    title: 'Creator commerce, sponsor activations, and basketball culture in one feed.',
    body:
      'A mobile-first RESURGENCE experience for creators, merch drops, sponsors, basketball events, and community stories.',
    ctaLabel: 'Open Feed',
    ctaHref: '/feed',
  },
  {
    key: 'home.discovery.event',
    title: 'DAYO Series OFW All-Star 2026',
    body:
      'Sponsor-ready basketball activation connecting OFW communities, brand partners, creator media, and event-day visibility.',
    ctaLabel: 'Open Event',
    ctaHref: '/events/dayo-series-ofw-all-star',
  },
  {
    key: 'home.discovery.creator',
    title: 'Creator-led commerce built for real community reach.',
    body:
      'Feature athletes, creators, coaches, sponsors, and community storytellers in one mobile-first discovery feed.',
    ctaLabel: 'View Creators',
    ctaHref: '/creators',
  },
  {
    key: 'home.discovery.shop',
    title: 'Merch, uniforms, apparel, and branded team gear.',
    body:
      'Browse official drops and route custom apparel needs into DesignXpress production workflows.',
    ctaLabel: 'Open Shop',
    ctaHref: '/shop',
  },
];

async function main() {
  for (const item of pageContentSeeds) {
    await prisma.pageContent.upsert({
      where: {
        key: item.key,
      },
      update: {
        title: item.title,
        body: item.body,
        ctaLabel: item.ctaLabel,
        ctaHref: item.ctaHref,
      },
      create: item,
    });

    console.log(`[seed-public-page-content] upserted ${item.key}`);
  }
}

main()
  .catch((error) => {
    console.error('[seed-public-page-content] failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
