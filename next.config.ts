import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb' // 또는 '50mb', '100mb' 등
    }
  }
};

export default nextConfig;
