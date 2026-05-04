import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pageContentSeeds = [
  {
    key: 'events.hero',
    title: 'Sponsorship-ready events, community activations, and creator moments.',
    body:
      'Explore official RESURGENCE event pages, review sponsorship opportunities, and apply for packages connected to each activation.',
    ctaLabel: 'View Sponsor Packages',
    ctaHref: '/sponsors',
  },
  {
    key: 'events.overview',
    title: 'Choose an event to open its sponsor landing page.',
    body:
      'Official RESURGENCE event pages connect sponsors, creators, basketball communities, and activation opportunities.',
    ctaLabel: 'Open Events',
    ctaHref: '/events',
  },
  {
    key: 'partnerships.hero',
    title:
      'A clean business landing page for collaborations, affiliates, and brand conversations.',
    body:
      'Resurgence Powered by DesignXpress keeps customer support, storefront activity, and business development on separate paths. Use this page when the conversation is about sponsorships, partnerships, referrals, branded programs, or custom commercial collaboration.',
    ctaLabel: 'Open contact intake',
    ctaHref: '/contact',
  },
  {
    key: 'partnerships.paths',
    title: 'Choose the route that fits the conversation.',
    body:
      'Route sponsorships, referrals, apparel programs, and larger commercial opportunities into the right business workflow.',
    ctaLabel: 'View Sponsor Packages',
    ctaHref: '/sponsors',
  },
  {
    key: 'support.hero',
    title: 'Live Support Desk for RESURGENCE Customer Service.',
    body:
      'A comprehensive customer service hub for sponsorships, shop orders, payments, basketball events, custom apparel, partnerships, and human follow-up.',
    ctaLabel: 'Email Support',
    ctaHref: 'mailto:support@resurgence-dx.biz',
  },
  {
    key: 'support.routing',
    title: 'Comprehensive help topics with accurate handoff rules.',
    body:
      'Support routes visitors into sponsorship, shop, payment, event, apparel, or partnership workflows.',
    ctaLabel: 'Open Support Desk',
    ctaHref: '/support',
  },
  {
    key: 'support.rules',
    title: 'Accurate answers, safe routing, clear next steps.',
    body:
      'Support answers should use official business details and route approval-sensitive requests to human follow-up.',
    ctaLabel: 'Contact Support',
    ctaHref: '/contact',
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
