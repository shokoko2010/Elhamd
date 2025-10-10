#!/bin/bash

echo "🚀 Starting production build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Check TypeScript
echo "🔍 Checking TypeScript types..."
npx tsc --noEmit

# Run linting
echo "🔧 Running ESLint..."
npm run lint

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
echo "📦 To start the production server, run: npm start"
