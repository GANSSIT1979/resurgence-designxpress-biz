export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'resurgence-dx.biz';
export const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || `https://www.${ROOT_DOMAIN}`;

export const PUBLIC_ROUTES = {
  home: '/',
  sponsors: '/sponsors',
  sponsorApply: '/sponsor/apply',
  events: '/events',
  dayoEvent: '/events/dayo-series-ofw-all-star',
  dayoEventApply: '/events/dayo-series-ofw-all-star/apply',
  feed: '/feed',
  creators: '/creators',
  shop: '/shop',
  contact: '/contact',
  support: '/support',
  admin: '/admin',
  adminEvents: '/admin/events',
  adminSponsorCrm: '/admin/sponsor-crm',
  crm: '/crm',
} as const;

export type PublicRouteKey = keyof typeof PUBLIC_ROUTES;

export function toPublicUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_SITE_URL.replace(/\/$/, '')}${normalizedPath}`;
}

export function getPublicRoute(key: PublicRouteKey, absolute = false) {
  const path = PUBLIC_ROUTES[key];
  return absolute ? toPublicUrl(path) : path;
}
