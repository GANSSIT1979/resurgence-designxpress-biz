export const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'resurgence-dx.biz';

export const DOMAINS = {
  root: `https://${ROOT_DOMAIN}`,
  www: `https://www.${ROOT_DOMAIN}`,
  admin: `https://admin.${ROOT_DOMAIN}`,
  crm: `https://crm.${ROOT_DOMAIN}`,
  login: `https://login.${ROOT_DOMAIN}`,
  feed: `https://feed.${ROOT_DOMAIN}`,
  events: `https://events.${ROOT_DOMAIN}`,
  shop: `https://shop.${ROOT_DOMAIN}`,
  partnership: `https://partnership.${ROOT_DOMAIN}`,
  support: `https://support.${ROOT_DOMAIN}`,
} as const;

export type AppDomainKey = keyof typeof DOMAINS;

export function normalizeHost(host: string) {
  return host.split(':')[0].toLowerCase();
}

export function getSubdomain(host: string) {
  const hostname = normalizeHost(host);

  if (hostname === ROOT_DOMAIN) return 'root';
  if (hostname === `www.${ROOT_DOMAIN}`) return 'www';

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return hostname.replace(`.${ROOT_DOMAIN}`, '');
  }

  return null;
}
