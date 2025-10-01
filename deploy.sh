#!/bin/bash

# Vercel Deployment Script
# This script deploys the project to Vercel with TypeScript errors ignored

echo "🚀 Starting Vercel Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || {
    echo "Please login to Vercel:"
    vercel login
}

# Build the project to ensure it works
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 Deployment complete!"
else
    echo "❌ Build failed!"
    exit 1
fi