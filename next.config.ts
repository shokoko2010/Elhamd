import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ["preview-chat-6b323351-ce1b-4e1b-b225-cc99f0ec3948.space.z.ai"],
  images: {
    // Temporarily disable image optimization to test if images load
    unoptimized: true,
  },
};

export default nextConfig;
