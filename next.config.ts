import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    // Exclude Firebase functions directory from TypeScript compilation
    tsconfigPath: './tsconfig.json',
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
    // Exclude Firebase functions directory from ESLint
    dirs: ['src'],
  },
  // Exclude scripts directory from build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false };
    }
    
    // Disable preloading that causes warnings
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: false,
          vendors: false,
        },
      },
    };
    
    return config;
  },
  allowedDevOrigins: [
  "preview-chat-6b323351-ce1b-4e1b-b225-cc99f0ec3948.space.z.ai",
  "preview-chat-e452f205-fd1b-4a33-90d8-b739e1e8cf3c.space.z.ai"
],
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    // Disable optimization for local images to prevent 400 errors
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Experimental features for performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Disable CSS optimization to prevent preload warnings
    optimizeCss: false,
    // Disable other optimizations that cause preload warnings
    optimizeServerReact: true,
  },
  
  // Server external packages
  serverExternalPackages: ['@prisma/client'],
  
  // Headers for security and performance
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      // Add any SEO redirects here
    ]
  },
  
  // Rewrites for performance
  async rewrites() {
    return [
      // Add any performance rewrites here
    ]
  },
  
  // Environment variables that should be available to the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
