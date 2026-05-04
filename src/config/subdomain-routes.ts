export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'resurgence-dx.biz';

export const SUBDOMAIN_PATHS: Record<string, string> = {
  admin: '/admin',
  crm: '/crm',
  login: '/login',
  feed: '/feed',
  events: '/events',
  shop: '/shop',
  partnership: '/partnerships',
  support: '/support',
};

export const PUBLIC_SUBDOMAINS = new Set([
  'feed',
  'events',
  'shop',
  'partnership',
  'support',
]);

export const AUTH_SUBDOMAINS = new Set(['admin', 'crm']);

export function normalizeHost(host: string) {
  return host.split(':')[0].toLowerCase();
}

export function getSubdomainFromHost(host: string) {
  const hostname = normalizeHost(host);

  if (hostname === ROOT_DOMAIN) return 'root';
  if (hostname === `www.${ROOT_DOMAIN}`) return 'www';

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return hostname.replace(`.${ROOT_DOMAIN}`, '');
  }

  return null;
}

export function getSubdomainBasePath(host: string) {
  const subdomain = getSubdomainFromHost(host);
  if (!subdomain || subdomain === 'root' || subdomain === 'www') return null;
  return SUBDOMAIN_PATHS[subdomain] || null;
}
