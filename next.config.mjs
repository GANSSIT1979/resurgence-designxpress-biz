import { networkInterfaces } from 'node:os';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
const hasHttpsOrigin = siteUrl.startsWith('https://') || process.env.FORCE_HTTPS === 'true';
const configuredDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const localNetworkDevOrigins = Object.values(networkInterfaces())
  .flat()
  .filter((details) => details?.family === 'IPv4' && !details.internal)
  .map((details) => details.address);
const allowedDevOrigins = Array.from(new Set([...localNetworkDevOrigins, ...configuredDevOrigins]));

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

if (hasHttpsOrigin) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000',
  });
}

const nextConfig = {
  allowedDevOrigins,
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
