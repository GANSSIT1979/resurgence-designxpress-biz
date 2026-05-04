import { PUBLIC_ROUTES, toPublicUrl } from '@/config/public-routes';

const PRIVATE_VERCEL_LINK_RE = /https:\/\/vercel\.com\/resurgence-designxpress-projects\/resurgence-designxpress-biz\/c\/[^\s)"']+/gi;

export function replacePrivateVercelLinks(input: string, replacement = PUBLIC_ROUTES.sponsors) {
  return input.replace(PRIVATE_VERCEL_LINK_RE, replacement);
}

export function assertNoPrivateVercelLink(input: string) {
  if (PRIVATE_VERCEL_LINK_RE.test(input)) {
    throw new Error('Private Vercel deployment/dashboard URL detected in public-facing content.');
  }
}

export function sponsorProposalLinks(eventSlug = 'dayo-series-ofw-all-star') {
  const eventPath = `/events/${eventSlug}`;
  return {
    sponsors: PUBLIC_ROUTES.sponsors,
    sponsorApply: PUBLIC_ROUTES.sponsorApply,
    event: eventPath,
    eventApply: `${eventPath}/apply`,
    contact: PUBLIC_ROUTES.contact,
    sponsorsUrl: toPublicUrl(PUBLIC_ROUTES.sponsors),
    sponsorApplyUrl: toPublicUrl(PUBLIC_ROUTES.sponsorApply),
    eventUrl: toPublicUrl(eventPath),
    eventApplyUrl: toPublicUrl(`${eventPath}/apply`),
    contactUrl: toPublicUrl(PUBLIC_ROUTES.contact),
  };
}
