import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    // Exclude Firebase functions directory from TypeScript compilation
    tsconfigPath: './tsconfig.json',
  },
  reactStrictMode: true,
  // Exclude scripts directory from build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false };
    }

    // Webpack config is cleaned up to use Next.js defaults for better performance
    config.optimization = {
      ...config.optimization,
    };

    return config;
  },
  allowedDevOrigins: [
    "https://elhamdimport.com"
  ],

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    // Enable optimization for all images
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Allow all local paths including API routes
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features for performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns', 'lodash'],
    // Enable CSS optimization
    optimizeCss: true,
    // Enable other optimizations
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
