/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'api.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  transpilePackages: ['@medical-spa/types', '@medical-spa/api-client', '@medical-spa/ui'],
};

module.exports = withPWA(nextConfig);
