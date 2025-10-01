# Vercel Deployment Guide

## 🚀 Deploy to Vercel with TypeScript Errors Ignored

This project is configured to deploy to Vercel even with TypeScript errors.

### Prerequisites
- Vercel account
- GitHub repository (recommended)
- Environment variables configured

### Quick Deploy

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Project**
   ```bash
   vercel
   ```

### Environment Variables Setup

#### Method 1: Vercel Dashboard (Recommended)
1. Go to your Vercel project dashboard
2. Click on "Settings" → "Environment Variables"
3. Add the following variables:

```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-very-secure-secret-key-here
DATABASE_URL=your_database_connection_string
```

#### Method 2: Using Vercel CLI
```bash
# Set environment variables
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL

# Then deploy
vercel --prod
```

#### Method 3: Using .env file (Local Development)
Create a `.env.local` file:
```
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Custom environment variables
CUSTOM_KEY="your-custom-key-here"
```

### Configuration Details

- **TypeScript Errors**: Ignored during build (`ignoreBuildErrors: true`)
- **ESLint Errors**: Ignored during build (`ignoreDuringBuilds: true`)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Deploy from GitHub

1. Push your code to GitHub
2. Connect your GitHub account to Vercel
3. Import the project
4. Configure environment variables in Vercel dashboard
5. Deploy

### Generate NEXTAUTH_SECRET

To generate a secure secret for NextAuth:
```bash
# Using Node.js
node -e "console.log(crypto.randomBytes(32).toString('base64'))"

# Using OpenSSL
openssl rand -base64 32

# Or use any random string generator (at least 32 characters)
```

### Post-Deployment

1. Test all API routes
2. Check database connectivity
3. Verify authentication flow
4. Monitor for runtime errors

## 📝 Notes

- TypeScript errors are ignored for deployment but should be fixed for production
- The app will build and run, but type-related runtime errors may occur
- Consider fixing TypeScript errors for better code quality
- Environment variables must be set in Vercel dashboard for production deployment

## 🔧 Troubleshooting

### Environment Variable Issues
- Make sure all environment variables are set in Vercel dashboard
- Check that variable names match exactly (case-sensitive)
- Ensure NEXTAUTH_URL includes https:// for production

### Build Issues
- TypeScript errors are ignored, but runtime errors may still occur
- Check Vercel build logs for any issues
- Ensure all dependencies are properly installed