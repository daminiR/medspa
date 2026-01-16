const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled React Strict Mode due to known issues with React Three Fiber (R3F)
  // R3F doesn't handle the double-mount/unmount cycle well, causing "_R3F" disposal errors
  // This only affects development - production builds are unaffected
  reactStrictMode: false,
  output: 'standalone',
  allowedDevOrigins: ['192.168.1.5', '192.168.1.8', '192.168.1.*'],
  webpack: (config) => {
    // Add parent node_modules to module resolution for monorepo
    config.resolve.modules.push(path.resolve(__dirname, '../../node_modules'))
    return config
  },
}

module.exports = nextConfig
