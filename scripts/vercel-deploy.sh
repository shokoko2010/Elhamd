#!/bin/bash

# Vercel Deployment Script for Elhamd Imports
# This script automates the deployment process

echo "🚀 Starting Elhamd Imports deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "🔍 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run 'vercel login' first."
    exit 1
fi

# Generate Prisma client
echo "📊 Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client. Please check your database configuration."
    exit 1
fi

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your application is now live at: https://elhamdimports.com"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi

# Run database migrations if needed
echo "🗄️ Running database migrations..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully."
else
    echo "⚠️  Database migrations failed, but deployment may still be successful."
fi

echo "🎉 Elhamd Imports deployment completed!"
echo "📱 Don't forget to test your PWA features on mobile devices!"
echo "📊 Check your analytics at: https://vercel.com/analytics"