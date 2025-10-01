#!/usr/bin/env node

// Enhanced build script for Vercel to show all errors
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting enhanced Vercel build with full error reporting...\n');

// Enable verbose logging
process.env.DEBUG = '*';
process.env.VERBOSITY = 'verbose';
process.env.NEXT_DEBUG = '1';
process.env.NEXT_TELEMETRY_DISABLED = '1';

try {
  // Step 1: Prisma generation with verbose output
  console.log('📦 Step 1: Generating Prisma client...');
  try {
    const prismaOutput = execSync('npx prisma generate', { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log('✅ Prisma generation completed\n');
  } catch (error) {
    console.error('❌ Prisma generation failed:');
    console.error(error.stdout || error.message);
    process.exit(1);
  }

  // Step 2: Type checking with detailed errors
  console.log('🔍 Step 2: Running TypeScript type checking...');
  try {
    const typeCheckOutput = execSync('npx tsc --noEmit --pretty', { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log('✅ TypeScript type checking passed\n');
  } catch (error) {
    console.error('❌ TypeScript errors found:');
    console.error(error.stdout || error.message);
    console.error('\n💡 To fix TypeScript errors, update the types in your files.');
    // Don't exit here, let the build continue to show other errors
  }

  // Step 3: ESLint checking with detailed output
  console.log('🔧 Step 3: Running ESLint...');
  try {
    const eslintOutput = execSync('npx eslint src --ext .ts,.tsx,.js,.jsx --format=verbose', { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log('✅ ESLint checking passed\n');
  } catch (error) {
    console.error('❌ ESLint errors found:');
    console.error(error.stdout || error.message);
    console.error('\n💡 To fix ESLint errors, update your code according to the linting rules.');
    // Don't exit here, let the build continue to show other errors
  }

  // Step 4: Next.js build with enhanced error reporting
  console.log('🏗️ Step 4: Building Next.js application...');
  try {
    const buildOutput = execSync('npm run build', { 
      encoding: 'utf8',
      stdio: 'inherit',
      maxBuffer: 10 * 1024 * 1024 // Increase buffer size for large outputs
    });
    console.log('✅ Next.js build completed successfully\n');
  } catch (error) {
    console.error('❌ Next.js build failed:');
    console.error('=== BUILD ERROR DETAILS ===');
    console.error(error.stdout || error.message);
    console.error('=== END ERROR DETAILS ===\n');
    
    // Try to extract specific error patterns
    const output = error.stdout || error.message;
    
    if (output.includes('Module not found')) {
      console.error('🔍 Missing dependencies detected. Check your imports and package.json');
    }
    
    if (output.includes('Type error')) {
      console.error('🔍 TypeScript errors detected. Check your types and interfaces');
    }
    
    if (output.includes('Failed to compile')) {
      console.error('🔍 Compilation errors detected. Check your syntax and imports');
    }
    
    if (output.includes('prisma')) {
      console.error('🔍 Database/Prisma errors detected. Check your schema and database connection');
    }
    
    process.exit(1);
  }

  console.log('🎉 All build steps completed successfully!');
  
} catch (error) {
  console.error('💥 Build process failed with unexpected error:');
  console.error(error.message);
  process.exit(1);
}