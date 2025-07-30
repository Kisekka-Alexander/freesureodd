/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@fortawesome/fontawesome-free"],
  },
  images: {
    domains: [],
  },
  // Configure webpack for better hot reload in Docker
  webpack: (config, { dev, isServer }) => {
    // Optimize for development in Docker
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
  // Disable type checking during development for better performance
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable eslint during development for better performance
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable standalone output for Docker
  output: "standalone",
};

module.exports = nextConfig;
