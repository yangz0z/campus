import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@campus/shared'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
