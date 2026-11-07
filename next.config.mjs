/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/ket-qua-xo-so/:region/:province.html',
        destination: '/:region/:province',
      },
      {
        source: '/ket-qua-xo-so/:region/:province',
        destination: '/:region/:province',
      },
      {
        source: '/:region/:province.html',
        destination: '/:region/:province',
      },
    ];
  },
};

export default nextConfig;
