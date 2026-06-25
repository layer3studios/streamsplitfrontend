/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || '',
    NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME || 'StreamSplit',
    NEXT_PUBLIC_BRAND_SLUG: process.env.NEXT_PUBLIC_BRAND_SLUG || 'streamsplit',
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

nextConfig.experimental = { missingSuspenseWithCSRBailout: false };
module.exports = nextConfig;
