# 🚀 Deployment Commands for Elhamd Imports

## 📋 Quick Commands

### 1. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### 2. Test Database Connection (Local)
```bash
# For Namecheap PostgreSQL
export DATABASE_URL="postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@business126.web-hosting.com:5432/bitcstcp_Elhamd"

# For Vercel Postgres (after creating)
export DATABASE_URL="your-vercel-postgres-url"

# For Supabase (after creating)
export DATABASE_URL="your-supabase-url"

# Test connection
npx prisma db push
```

### 3. Build Application
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Start development server
npm run dev
```

## 🚀 Vercel Deployment Commands

### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Import Git repository
3. Add environment variables
4. Deploy

### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NODE_ENV production

# Deploy
vercel --prod
```

### Option C: GitHub Integration
```bash
# Connect GitHub repository to Vercel
# Push changes to trigger deployment
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

## 🗄️ Database Setup Commands

### Vercel Postgres Setup
```bash
# Create Vercel Postgres database
# 1. Go to Vercel Dashboard → Storage
# 2. Click "Create Database"
# 3. Choose PostgreSQL
# 4. Copy the provided DATABASE_URL

# Test connection
export DATABASE_URL="your-vercel-postgres-url"
npx prisma db push
```

### Supabase Setup
```bash
# 1. Go to supabase.com
# 2. Create new project
# 3. Get connection string from settings

# Test connection
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
npx prisma db push
```

### Neon Setup
```bash
# 1. Go to neon.tech
# 2. Create new project
# 3. Get connection string

# Test connection
export DATABASE_URL="your-neon-connection-string"
npx prisma db push
```

## 🔧 Environment Variables Setup

### Create .env.vercel file
```bash
cat > .env.vercel << EOF
# Database Configuration
DATABASE_URL=your-database-url-here

# NextAuth Configuration
NEXTAUTH_URL=https://elhamdimports.com
NEXTAUTH_SECRET=your-generated-secret-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://elhamdimports.com
NODE_ENV=production

# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
EOF
```

### Load environment variables
```bash
# Load from .env.vercel
export $(cat .env.vercel | grep -v '^#' | xargs)

# Test database connection
npx prisma db push
```

## 📱 Testing Commands

### Test Locally
```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Test Build
```bash
# Build for production
npm run build

# Start production server locally
npm start

# Open browser
open http://localhost:3000
```

### Test Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# View database
npx prisma studio
```

## 🔍 Troubleshooting Commands

### Clear Cache and Rebuild
```bash
# Remove node_modules and .next
rm -rf node_modules .next

# Clean npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

### Check Environment Variables
```bash
# Show current environment variables
env | grep -E "(DATABASE_URL|NEXTAUTH|NODE_ENV)"

# Test database connection
npx prisma db push
```

### Check Vercel Deployment
```bash
# Check Vercel logs
vercel logs

# Check deployment status
vercel ls

# Inspect environment variables
vercel env ls
```

## 📊 Monitoring Commands

### Check Application Health
```bash
# Check if application is running
curl -I https://elhamdimports.com

# Check specific endpoints
curl -I https://elhamdimports.com/api/health
curl -I https://elhamdimports.com/vehicles
```

### Check Database Health
```bash
# Test database connection
npx prisma db execute --stdin << EOF
SELECT version();
EOF

# Check database size
npx prisma db execute --stdin << EOF
SELECT pg_size_pretty(pg_database_size('bitcstcp_Elhamd'));
EOF
```

## 🔄 Maintenance Commands

### Database Backup
```bash
# Backup PostgreSQL database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup-20231201.sql
```

### Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Audit for security vulnerabilities
npm audit
npm audit fix
```

## 🎯 Quick Deployment Script

Create a deployment script:
```bash
#!/bin/bash

# deployment.sh

echo "🚀 Starting Elhamd Imports Deployment..."

# Generate NEXTAUTH_SECRET if not exists
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "🔐 Generating NEXTAUTH_SECRET..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
fi

# Test database connection
echo "🗄️ Testing database connection..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Build application
echo "🏗️ Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 Ready for deployment!"
echo "Add these environment variables to Vercel:"
echo "DATABASE_URL=$DATABASE_URL"
echo "NEXTAUTH_URL=https://elhamdimports.com"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "NEXT_PUBLIC_SITE_URL=https://elhamdimports.com"
echo "NODE_ENV=production"
```

Make it executable:
```bash
chmod +x deployment.sh
./deployment.sh
```

---

## 🎊 Ready to Deploy!

**Choose your database option and run the appropriate commands. Your Elhamd Imports website will be live in no time!**

### Recommended Quick Start:
1. **Generate secret**: `openssl rand -base64 32`
2. **Set up Vercel Postgres** (easiest option)
3. **Test connection**: `npx prisma db push`
4. **Deploy via Vercel Dashboard**
5. **Configure domain**
6. **Go live!** 🚀