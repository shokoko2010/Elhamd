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

# Check if environment variables are set
echo "🔍 Checking environment variables..."
if [ -z "$NEXTAUTH_URL" ] || [ -z "$NEXTAUTH_SECRET" ] || [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Warning: Environment variables not set!"
    echo "Please set the following environment variables:"
    echo "- NEXTAUTH_URL (e.g., https://your-app.vercel.app)"
    echo "- NEXTAUTH_SECRET (run: node generate-secret.js)"
    echo "- DATABASE_URL"
    echo ""
    echo "You can set them using:"
    echo "vercel env add NEXTAUTH_URL"
    echo "vercel env add NEXTAUTH_SECRET"
    echo "vercel env add DATABASE_URL"
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the project to ensure it works
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 Deployment complete!"
    echo "📝 Don't forget to set environment variables in your Vercel dashboard!"
else
    echo "❌ Build failed!"
    exit 1
fi