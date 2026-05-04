/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/sponsor/apply',
        destination: '/events/dayo-series-ofw-all-star/apply',
        permanent: false,
      },
      {
        source: '/sponsor-apply',
        destination: '/events/dayo-series-ofw-all-star/apply',
        permanent: false,
      },
      {
        source: '/sponsor',
        destination: '/sponsors',
        permanent: false,
      },
      {
        source: '/merch',
        destination: '/shop',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
