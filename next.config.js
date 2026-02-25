const BRAND = require('../brand.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || '',
    NEXT_PUBLIC_BRAND_NAME: BRAND.name,
    NEXT_PUBLIC_BRAND_SLUG: BRAND.slug,
  },
  images: {
    domains: ['localhost', 'ucarecdn.com', 'upload.wikimedia.org'],
    unoptimized: true,
  },
  // Proxy API requests to backend (avoids CORS in dev + production)
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${backendUrl}/socket.io/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
