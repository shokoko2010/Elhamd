# 🚀 Deployment Instructions for elhamdimport.com

## 📋 Overview
This document provides step-by-step instructions for deploying the application to production on elhamdimport.com.

## 🔧 Environment Variables Required

### Critical Variables for Production
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://elhamdimport.com
NEXTAUTH_SECRET=your-secure-production-secret-key-here

# Database Configuration
DATABASE_URL=your-production-database-url
PRISMA_DATABASE_URL=your-prisma-accelerate-url

# Application Configuration
NODE_ENV=production
```

## 🛠️ Pre-Deployment Checklist

### 1. Generate Secure Secret
```bash
openssl rand -base64 32
```

### 2. Update Environment Variables
- Set `NEXTAUTH_URL=https://elhamdimport.com`
- Set `NEXTAUTH_SECRET` to the generated secure key
- Ensure `DATABASE_URL` points to production database
- Set `NODE_ENV=production`

### 3. Database Setup
- Ensure admin user exists: `admin@elhamdimport.online`
- Verify database is accessible from production
- Run database migrations if needed

## 🚀 Deployment Steps

### 1. Commit Changes
```bash
git add .
git commit -m "Fix production authentication for elhamdimport.com"
git push origin main
```

### 2. Deploy to Production
- If using Vercel: Push to trigger automatic deployment
- If using custom hosting: Follow your hosting provider's deployment process

### 3. Verify Deployment
1. Visit `https://elhamdimport.com`
2. Test login with admin credentials
3. Use `/vercel-debug` page to verify authentication
4. Test API endpoints with `/test-auth` page

## 🔍 Testing Checklist

### Authentication Tests
- [ ] Login works with admin@elhamdimport.online
- [ ] Session persists across page refreshes
- [ ] API endpoints return 200 instead of 500
- [ ] Customer creation works
- [ ] Invoice creation works

### Debug Pages
- [ ] `/vercel-debug` shows correct environment info
- [ ] `/test-auth` shows successful API tests
- [ ] Console logs show authentication success

## 🆘 Troubleshooting

### If 500 Errors Persist
1. Check browser console for specific error messages
2. Visit `/vercel-debug` for detailed diagnostics
3. Verify environment variables are set correctly
4. Check server logs for authentication errors

### Common Issues
- **JWT Errors**: Ensure NEXTAUTH_SECRET is set correctly
- **Database Errors**: Verify DATABASE_URL is accessible
- **CORS Errors**: Check domain configuration
- **Session Issues**: Clear browser cookies and retry

## 📞 Support

If issues persist after following these instructions:
1. Check browser console for specific errors
2. Visit `/vercel-debug` for diagnostic information
3. Review server logs for authentication errors
4. Verify all environment variables are correctly set

## 🔐 Security Notes

- Never commit secrets to version control
- Use HTTPS in production
- Regularly rotate secrets
- Monitor for authentication failures
- Keep dependencies updated

---

**Last Updated**: 2024-01-XX
**Version**: 1.0.0