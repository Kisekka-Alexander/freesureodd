/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@fortawesome/fontawesome-free"],
  },
  images: {
    domains: [],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors:
      process.env.CI === "1" || process.env.SKIP_TYPE_CHECK === "1",
  },
  eslint: {
    // Skip ESLint during builds in CI/Docker to prevent hangs
    ignoreDuringBuilds: process.env.CI === "1" || process.env.SKIP_LINT === "1",
  },
  // Enable standalone output for Docker
  output: "standalone",
};

module.exports = nextConfig;
