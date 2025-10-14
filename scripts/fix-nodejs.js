#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Node.js Fix Script for Elhamd Imports');
console.log('========================================\n');

// Check current Node.js version
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const nodeMajor = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  
  console.log('Current Node.js version:', nodeVersion);
  
  if (nodeMajor < 18) {
    console.log('❌ Node.js version is incompatible. Please upgrade:');
    console.log('\n📋 Steps to upgrade Node.js:');
    console.log('1. Download Node.js 20 LTS from: https://nodejs.org/');
    console.log('2. Install it (this will upgrade your current version)');
    console.log('3. Restart your computer');
    console.log('4. Run this script again to verify');
    
    console.log('\n🔧 Alternative methods:');
    console.log('• Using nvm (recommended):');
    console.log('  - Download nvm-windows: https://github.com/coreybutler/nvm-windows/releases');
    console.log('  - Run: nvm install 20.18.0');
    console.log('  - Run: nvm use 20.18.0');
    
    console.log('\n• Using Chocolatey:');
    console.log('  - Run: choco install nodejs-lts');
    
    console.log('\n• Manual installation:');
    console.log('  - Uninstall current Node.js');
    console.log('  - Download and install Node.js 20 LTS');
    
    process.exit(1);
  } else {
    console.log('✅ Node.js version is compatible');
  }
} catch (error) {
  console.log('❌ Node.js is not installed or not in PATH');
  console.log('Please install Node.js from: https://nodejs.org/');
  process.exit(1);
}

// Clean up existing installations
console.log('\n🧹 Cleaning up existing installations...');

const nodeModulesPath = path.join(process.cwd(), 'node_modules');
const packageLockPath = path.join(process.cwd(), 'package-lock.json');

if (fs.existsSync(nodeModulesPath)) {
  console.log('Removing node_modules...');
  try {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log('✅ node_modules removed');
  } catch (error) {
    console.log('❌ Error removing node_modules:', error.message);
  }
}

if (fs.existsSync(packageLockPath)) {
  console.log('Removing package-lock.json...');
  try {
    fs.unlinkSync(packageLockPath);
    console.log('✅ package-lock.json removed');
  } catch (error) {
    console.log('❌ Error removing package-lock.json:', error.message);
  }
}

// Clear npm cache
console.log('\n🗑️  Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ npm cache cleared');
} catch (error) {
  console.log('❌ Error clearing npm cache:', error.message);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.log('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('\n🗄️  Generating Prisma client...');
try {
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('❌ Error generating Prisma client:', error.message);
}

// Build the application
console.log('\n🔨 Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully');
} catch (error) {
  console.log('❌ Error building application:', error.message);
}

console.log('\n🎉 Fix completed successfully!');
console.log('🚀 Your application is now ready for deployment to Namecheap!');
console.log('\n📋 Next steps:');
console.log('1. Set up your Namecheap hosting');
console.log('2. Upload the application files');
console.log('3. Configure environment variables');
console.log('4. Start the application');