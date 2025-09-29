# 🚀 Elhamd Imports Vercel Deployment Guide

## 📋 Prerequisites
- ✅ PostgreSQL database details from Namecheap
- ✅ Vercel account
- ✅ Domain `elhamdimports.com` ready
- ✅ Git repository with project code

## 🔧 Environment Variables

### Required Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@localhost:5432/bitcstcp_Elhamd

# NextAuth Configuration
NEXTAUTH_URL=https://elhamdimports.com
NEXTAUTH_SECRET=your-32-character-secret-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://elhamdimports.com

# Node Environment
NODE_ENV=production
```

### Optional Variables
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Contact Information
CONTACT_PHONE=+201234567890
CONTACT_EMAIL=info@elhamdimports.com
```

## 🛠️ Setup Steps

### Step 1: Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Replace `your-32-character-secret-here` with the generated value.

### Step 2: Test Database Connection Locally
```bash
# Set environment variables
export DATABASE_URL="postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@localhost:5432/bitcstcp_Elhamd"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="your-test-secret-here"

# Generate Prisma client
npx prisma generate

# Test database connection
npx prisma db push
```

### Step 3: Build and Test Locally
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start development server
npm run dev
```

### Step 4: Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. **Import Git Repository**:
   - Connect your GitHub repository
   - Select the Elhamd Imports repository
   - Click **"Import"**
4. **Configure Project**:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. **Add Environment Variables**:
   - Go to **Settings** → **Environment Variables**
   - Add all the variables from the "Required Variables" section above
   - Make sure to select **Production** environment
6. **Deploy**:
   - Click **"Deploy"**
   - Wait for deployment to complete

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
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

### Step 5: Configure Domain
1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Add your domain: `elhamdimports.com`
3. Follow the DNS configuration instructions:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com.
   ```
4. Update your domain's DNS settings in Namecheap

### Step 6: Post-Deployment Setup

#### Database Migration
```bash
# After deployment, run database migration
npx prisma db push
```

#### Test the Application
- Visit `https://elhamdimports.com`
- Test all features:
  - Homepage loads
  - Vehicle pages work
  - Booking forms function
  - Admin panel accessible
  - PWA features work

## 🔍 Troubleshooting

### Database Connection Issues
If you get connection errors:

1. **Check PostgreSQL accessibility**:
   ```bash
   # Test connection with psql
   psql "postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@localhost:5432/bitcstcp_Elhamd" -c "SELECT version();"
   ```

2. **Try with SSL**:
   ```bash
   DATABASE_URL=postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@localhost:5432/bitcstcp_Elhamd?sslmode=require
   ```

3. **Check Namecheap PostgreSQL settings**:
   - Ensure remote connections are allowed
   - Verify the hostname (might not be `localhost`)
   - Check if PostgreSQL is running on port 5432

### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules .next
npm install
npm run build
```

### Environment Variables Issues
1. **Verify all variables are set** in Vercel dashboard
2. **Check for typos** in variable names
3. **Ensure NEXTAUTH_SECRET is at least 32 characters**

## 📊 Monitoring and Analytics

### Vercel Analytics
1. Go to **Analytics** in Vercel Dashboard
2. Enable **Vercel Analytics**
3. Monitor performance and errors

### Google Analytics
Add your Google Analytics ID:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🔄 Updates and Maintenance

### Automatic Deployments
- Push to main branch → Automatic deployment
- Pull requests → Preview deployments
- Environment variables automatically applied

### Database Backups
- Namecheap provides automated backups
- Regularly export your database:
  ```bash
  pg_dump $DATABASE_URL > backup.sql
  ```

## 🎉 Success Checklist

- [ ] Application deployed to Vercel
- [ ] Domain `elhamdimports.com` configured
- [ ] SSL certificate active
- [ ] Database connection working
- [ ] All pages loading correctly
- [ ] Booking forms functional
- [ ] Admin panel accessible
- [ ] PWA features working
- [ ] Analytics configured

## 📞 Support

If you encounter issues:
1. **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
2. **Vercel Status**: [vercel.com/status](https://vercel.com/status)
3. **Namecheap Support**: Contact through Namecheap dashboard
4. **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**🎊 Congratulations! Your Elhamd Imports website is now live on Vercel with Namecheap PostgreSQL!**