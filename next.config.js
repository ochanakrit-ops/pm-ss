/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverMinification: false,
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
