#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Environment Check for Elhamd Imports');
console.log('=====================================\n');

// Check Node.js version
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const nodeMajor = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  
  console.log('📋 Node.js Version:', nodeVersion);
  
  if (nodeMajor < 18) {
    console.log('❌ Node.js version is too old. Please upgrade to Node.js 18.18 or higher.');
    console.log('💡 Recommended: Download Node.js 20 LTS from https://nodejs.org/');
    process.exit(1);
  } else {
    console.log('✅ Node.js version is compatible');
  }
} catch (error) {
  console.log('❌ Node.js is not installed or not in PATH');
  process.exit(1);
}

// Check npm version
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  const npmMajor = parseInt(npmVersion.split('.')[0]);
  
  console.log('📋 npm Version:', npmVersion);
  
  if (npmMajor < 8) {
    console.log('⚠️  npm version is old. Consider upgrading.');
  } else {
    console.log('✅ npm version is compatible');
  }
} catch (error) {
  console.log('❌ npm is not installed or not in PATH');
  process.exit(1);
}

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('✅ package.json found');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('📦 Project:', packageJson.name);
    console.log('📦 Version:', packageJson.version);
  } catch (error) {
    console.log('❌ Error reading package.json');
  }
} else {
  console.log('❌ package.json not found');
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules found');
} else {
  console.log('⚠️  node_modules not found. Run "npm install"');
}

// Check Prisma
try {
  const prismaVersion = execSync('npx prisma --version', { encoding: 'utf8' }).trim();
  console.log('📋 Prisma:', prismaVersion);
} catch (error) {
  console.log('❌ Prisma is not installed');
}

// Check Next.js
try {
  const nextVersion = execSync('npx next --version', { encoding: 'utf8' }).trim();
  console.log('📋 Next.js:', nextVersion);
} catch (error) {
  console.log('❌ Next.js is not installed');
}

console.log('\n🎯 Recommended Actions:');
console.log('1. Update Node.js to version 20 LTS');
console.log('2. Run "npm install" to install dependencies');
console.log('3. Run "npm run db:generate" to generate Prisma client');
console.log('4. Run "npm run build" to build the application');
console.log('5. Run "npm run dev" to start development server');

console.log('\n🚀 Ready for deployment to Namecheap!');