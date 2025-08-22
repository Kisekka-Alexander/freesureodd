/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@fortawesome/fontawesome-free"],
  },
  images: {
    domains: ["media.api-sports.io"],
  },
  typescript: {
    // Allow type errors during development for faster iteration
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during development builds for speed
    ignoreDuringBuilds: true,
  },
  // Remove standalone output for development (causes compilation issues)
  // output: "standalone", // Only for production

  // Optimize for development and Docker
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Enable file system polling for Docker on macOS/Windows
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
