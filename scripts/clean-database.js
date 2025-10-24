#!/usr/bin/env node

/**
 * Database Cleanup Script
 * 
 * This script automatically detects the database type (SQLite or PostgreSQL)
 * and performs appropriate cleanup operations.
 * 
 * Environment Variables:
 * - NEXT_BUILD_CLEAN_DB: Set to 'true' to enable cleanup during build
 * - DATABASE_URL: Database connection string
 * - NODE_ENV: Environment (development, production, etc.)
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Detects the database type based on Prisma configuration
 */
async function detectDatabaseType() {
  try {
    const prisma = new PrismaClient();
    
    // Get the datasource URL from Prisma configuration
    const { datasourceUrl } = prisma._engineConfig || {};
    const databaseUrl = datasourceUrl || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in environment or Prisma configuration');
    }
    
    logInfo(`Database URL detected: ${databaseUrl.replace(/\/\/.*@/, '//***:***@')}`);
    
    // Detect database type
    const isPostgreSQL = databaseUrl.includes('postgresql://') || databaseUrl.includes('postgres://');
    const isSQLite = databaseUrl.includes('file:') || databaseUrl.endsWith('.db') || databaseUrl.endsWith('.sqlite');
    
    await prisma.$disconnect();
    
    if (isPostgreSQL) {
      log('🐘 PostgreSQL database detected', 'cyan');
      return 'postgresql';
    } else if (isSQLite) {
      log('🗄️  SQLite database detected', 'cyan');
      return 'sqlite';
    } else {
      throw new Error(`Unsupported database type: ${databaseUrl.substring(0, 50)}...`);
    }
  } catch (error) {
    logError(`Failed to detect database type: ${error.message}`);
    throw error;
  }
}

/**
 * Gets all table names from the database
 */
async function getAllTables(prisma, dbType) {
  try {
    let tables = [];
    
    if (dbType === 'postgresql') {
      // PostgreSQL: Get all user tables
      const result = await prisma.$queryRaw`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE '_prisma_%'
        ORDER BY tablename
      `;
      tables = result.map(row => row.tablename);
    } else if (dbType === 'sqlite') {
      // SQLite: Get all tables
      const result = await prisma.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE '_prisma_%'
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `;
      tables = result.map(row => row.name);
    }
    
    logInfo(`Found ${tables.length} tables to clean`);
    return tables;
  } catch (error) {
    logError(`Failed to get table names: ${error.message}`);
    throw error;
  }
}

/**
 * Cleans PostgreSQL database
 */
async function cleanPostgreSQL(prisma) {
  log('🧹 Starting PostgreSQL cleanup...', 'magenta');
  
  try {
    // Get all tables
    const tables = await getAllTables(prisma, 'postgresql');
    
    if (tables.length === 0) {
      logWarning('No tables found to clean');
      return;
    }
    
    // Disable foreign key constraints temporarily
    logInfo('Disabling foreign key constraints...');
    await prisma.$executeRaw`SET session_replication_role = replica;`;
    
    // Clean each table
    for (const table of tables) {
      logInfo(`Cleaning table: ${table}`);
      
      // Skip tables with invalid names
      if (!table || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
        logWarning(`Skipping table with invalid name: ${table}`);
        continue;
      }
      
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
    }
    
    // Re-enable foreign key constraints
    logInfo('Re-enabling foreign key constraints...');
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;
    
    logSuccess(`PostgreSQL cleanup completed. ${tables.length} tables cleaned.`);
    
  } catch (error) {
    // Make sure to re-enable constraints even if an error occurs
    try {
      await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;
    } catch (cleanupError) {
      logError(`Failed to re-enable constraints: ${cleanupError.message}`);
    }
    throw error;
  }
}

/**
 * Cleans SQLite database
 */
async function cleanSQLite(prisma) {
  log('🧹 Starting SQLite cleanup...', 'magenta');
  
  try {
    // Get all tables
    const tables = await getAllTables(prisma, 'sqlite');
    
    if (tables.length === 0) {
      logWarning('No tables found to clean');
      return;
    }
    
    // Disable foreign key constraints
    logInfo('Disabling foreign key constraints...');
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
    
    // Clean each table
    for (const table of tables) {
      logInfo(`Cleaning table: ${table}`);
      
      // Skip tables with invalid names
      if (!table || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
        logWarning(`Skipping table with invalid name: ${table}`);
        continue;
      }
      
      // Delete all data from the table
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
      
      // Reset auto-increment sequence if it exists
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM sqlite_sequence WHERE name = '${table}';`
        );
      } catch (error) {
        // sqlite_sequence table doesn't exist, which is fine
        logWarning(`sqlite_sequence table not found, skipping sequence reset for ${table}`);
      }
    }
    
    // Optimize the database
    logInfo('Optimizing database...');
    await prisma.$executeRaw`VACUUM;`;
    
    // Re-enable foreign key constraints
    logInfo('Re-enabling foreign key constraints...');
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
    
    logSuccess(`SQLite cleanup completed. ${tables.length} tables cleaned.`);
    
  } catch (error) {
    // Make sure to re-enable constraints even if an error occurs
    try {
      await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
    } catch (cleanupError) {
      logError(`Failed to re-enable constraints: ${cleanupError.message}`);
    }
    throw error;
  }
}

/**
 * Main cleanup function
 */
async function cleanDatabase() {
  const startTime = Date.now();
  
  log('🚀 Starting database cleanup process...', 'bright');
  logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logInfo(`Build cleanup enabled: ${process.env.NEXT_BUILD_CLEAN_DB || 'false'}`);
  
  // Check if cleanup should run
  if (process.env.NEXT_BUILD_CLEAN_DB !== 'true') {
    logWarning('Database cleanup is disabled. Set NEXT_BUILD_CLEAN_DB=true to enable.');
    return;
  }
  
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    logInfo('Testing database connection...');
    await prisma.$connect();
    logSuccess('Database connection successful');
    
    // Detect database type
    const dbType = await detectDatabaseType();
    
    // Perform cleanup based on database type
    if (dbType === 'postgresql') {
      await cleanPostgreSQL(prisma);
    } else if (dbType === 'sqlite') {
      await cleanSQLite(prisma);
    } else {
      throw new Error(`Unsupported database type: ${dbType}`);
    }
    
    const duration = Date.now() - startTime;
    logSuccess(`Database cleanup completed successfully in ${duration}ms`);
    
  } catch (error) {
    logError(`Database cleanup failed: ${error.message}`);
    logError(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    logInfo('Database connection closed');
  }
}

/**
 * Handle process termination gracefully
 */
process.on('SIGINT', () => {
  logWarning('Received SIGINT. Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logWarning('Received SIGTERM. Gracefully shutting down...');
  process.exit(0);
});

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanDatabase().catch((error) => {
    logError(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { cleanDatabase, detectDatabaseType };