import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb' // 또는 '50mb', '100mb' 등
    }
  },
  async rewrites() {
    return [
      {
        source: '/api/admin-tables/:path*',
        destination: 'https://3.36.128.11:9000/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
