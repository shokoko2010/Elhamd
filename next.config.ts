import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ["preview-chat-f6e4eea8-f4ab-44ee-ab1a-e37e835aa059.space.z.ai"],
};

export default nextConfig;
