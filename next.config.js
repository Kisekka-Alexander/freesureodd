/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@fortawesome/fontawesome-free"],
  },
  images: {
    domains: ["media.api-sports.io"],
    unoptimized: true,
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
  // Ignore errors for S3 deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Build as standalone 
  output: "standalone",
  distDir: ".next",
};

module.exports = nextConfig;
