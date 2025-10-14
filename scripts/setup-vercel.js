#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Elhamd Imports Vercel Setup Script');
console.log('=====================================\n');

async function setupVercel() {
  try {
    // Step 1: Generate NEXTAUTH_SECRET
    console.log('🔐 Step 1: Generating NEXTAUTH_SECRET...');
    const nextauthSecret = execSync('openssl rand -base64 32', { encoding: 'utf8' }).trim();
    console.log('✅ NEXTAUTH_SECRET generated successfully\n');

    // Step 2: Update .env.vercel file
    console.log('📝 Step 2: Updating .env.vercel file...');
    const envContent = `# Database Configuration
DATABASE_URL=postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@localhost:5432/bitcstcp_Elhamd

# NextAuth Configuration
NEXTAUTH_URL=https://elhamdimports.com
NEXTAUTH_SECRET=${nextauthSecret}

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://elhamdimports.com

# Node Environment
NODE_ENV=production

# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Contact Information
CONTACT_PHONE=+201234567890
CONTACT_EMAIL=info@elhamdimports.com`;

    fs.writeFileSync('.env.vercel', envContent);
    console.log('✅ .env.vercel file updated\n');

    // Step 3: Test database connection
    console.log('🗄️ Step 3: Testing database connection...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Database connection successful\n');
    } catch (error) {
      console.log('❌ Database connection failed. Please check your PostgreSQL configuration.\n');
      console.log('Make sure:');
      console.log('1. PostgreSQL is running on Namecheap');
      console.log('2. Remote connections are allowed');
      console.log('3. The database details are correct\n');
    }

    // Step 4: Build application
    console.log('🏗️ Step 4: Building application...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Application built successfully\n');
    } catch (error) {
      console.log('❌ Build failed. Please check for errors in your code.\n');
    }

    // Step 5: Deployment instructions
    console.log('🚀 Step 5: Deployment Instructions');
    console.log('=====================================');
    console.log('\n1. Vercel Dashboard Method:');
    console.log('   - Go to https://vercel.com/dashboard');
    console.log('   - Click "New Project"');
    console.log('   - Import your Git repository');
    console.log('   - Add environment variables from .env.vercel');
    console.log('   - Click "Deploy"');
    console.log('\n2. Vercel CLI Method:');
    console.log('   - Install CLI: npm i -g vercel');
    console.log('   - Login: vercel login');
    console.log('   - Add environment variables manually');
    console.log('   - Deploy: vercel --prod');
    console.log('\n3. Environment Variables to Add in Vercel:');
    console.log('   DATABASE_URL=postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@localhost:5432/bitcstcp_Elhamd');
    console.log(`   NEXTAUTH_URL=https://elhamdimports.com`);
    console.log(`   NEXTAUTH_SECRET=${nextauthSecret}`);
    console.log('   NEXT_PUBLIC_SITE_URL=https://elhamdimports.com');
    console.log('   NODE_ENV=production');
    console.log('\n4. Domain Configuration:');
    console.log('   - Add domain: elhamdimports.com');
    console.log('   - Configure DNS records as shown in Vercel');
    console.log('\n✅ Setup complete! Your application is ready for deployment.\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupVercel();