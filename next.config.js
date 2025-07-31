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
  // Only ignore type checking and eslint during development
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "development",
  },
  // Enable standalone output for Docker
  output: "standalone",
};

module.exports = nextConfig;
