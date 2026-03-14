/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  distDir: '.next',
  // Disable static generation for pages that use dynamic data
  staticPageGenerationTimeout: 120,
  // Ensure all API routes are treated as dynamic
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
};

export default nextConfig;
