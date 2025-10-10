# Elhamd Cars - Deployment Guide

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis (optional, for caching)
- Domain with SSL certificate

## 🚀 Quick Deployment

### 1. Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd elhamd-cars

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed initial data
npm run db:seed
```

### 3. Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Environment Variables

Required variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/elhamd_db

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key

# Application
NODE_ENV=production
PORT=3000
```

## 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t elhamd-cars .

# Run container
docker run -p 3000:3000 --env-file .env elhamd-cars
```

## 🌐 Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🔍 Default Login Credentials

After seeding the database:

- **Admin**: admin@elhamd.com / admin123
- **Staff**: staff@elhamd.com / staff123  
- **Customer**: customer@elhamd.com / customer123

⚠️ **Change these passwords in production!**

## 📊 Monitoring

- Health check: `/api/health`
- Logs: Check your hosting provider's logs
- Database: Use Prisma Studio (`npx prisma studio`)

## 🛠️ Troubleshooting

### Build Issues
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues
```bash
# Reset database
npx prisma migrate reset
npm run db:seed
```

### Auth Issues
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Clear browser cookies

## 📝 Post-Deployment Checklist

- [ ] Update default passwords
- [ ] Configure domain SSL
- [ ] Set up monitoring
- [ ] Test all user flows
- [ ] Configure email settings
- [ ] Set up backups
- [ ] Review security settings