#!/usr/bin/env tsx

/**
 * Database Cleaning Script for Vercel Builds
 * 
 * This script cleans the database before a new build on Vercel.
 * It removes all data while preserving the schema structure.
 * 
 * Usage: Called automatically during Vercel build process
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function cleanDatabase() {
  const startTime = Date.now()
  console.log('🧹 Starting database cleaning for Vercel build...')
  console.log(`📅 Timestamp: ${new Date().toISOString()}`)
  
  try {
    // Check if we're in production/Vercel environment
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production' || process.env.VERCEL_CLEAN_DB === 'true'
    const shouldClean = process.env.NEXT_BUILD_CLEAN_DB === 'true' || isVercel
    
    if (!shouldClean) {
      console.log('ℹ️ Database cleaning not required - skipping')
      console.log(`🔍 Environment check: VERCEL=${process.env.VERCEL}, NEXT_BUILD_CLEAN_DB=${process.env.NEXT_BUILD_CLEAN_DB}`)
      process.exit(0)
    }

    console.log('🌐 Detected Vercel/production environment, proceeding with database cleaning...')
    console.log(`🔧 Environment: VERCEL=${process.env.VERCEL}, VERCEL_ENV=${process.env.VERCEL_ENV}`)

    // Test database connection first
    console.log('🔌 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Get database info
    const dbInfo = await prisma.$queryRaw`PRAGMA database_list`
    console.log('📊 Database info:', dbInfo)

    // Get all table names from the database (excluding system tables)
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_prisma_migrations'
      AND name NOT LIKE 'pg_%'
      ORDER BY name
    `
    
    console.log(`📋 Found ${(tables as any[]).length} tables to clean`)
    
    if ((tables as any[]).length === 0) {
      console.log('ℹ️ No tables found to clean')
      await prisma.$disconnect()
      process.exit(0)
    }

    // Log table names for debugging
    console.log('📝 Tables to clean:', (tables as any[]).map(t => (t as any).name).join(', '))

    // Disable foreign key constraints temporarily (for SQLite)
    try {
      await prisma.$executeRaw`PRAGMA foreign_keys = OFF`
      console.log('🔓 Foreign key constraints disabled')
    } catch (error) {
      console.log('ℹ️ Could not disable foreign keys (might be PostgreSQL):', error instanceof Error ? error.message : error)
    }
    
    // Clean each table with better error handling
    let cleanedCount = 0
    let failedCount = 0
    
    for (const table of tables as any[]) {
      const tableName = table.name
      console.log(`🗑️ Cleaning table: ${tableName}`)
      
      try {
        // Get row count before cleaning
        const countResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`)
        const rowCount = (countResult as any[])[0]?.count || 0
        
        if (rowCount > 0) {
          await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}"`)
          console.log(`✅ Cleaned table: ${tableName} (removed ${rowCount} rows)`)
          cleanedCount++
        } else {
          console.log(`ℹ️ Table ${tableName} is already empty`)
          cleanedCount++
        }
      } catch (error) {
        console.warn(`⚠️ Warning: Could not clean table ${tableName}:`, error instanceof Error ? error.message : error)
        failedCount++
      }
    }

    // Re-enable foreign key constraints (for SQLite)
    try {
      await prisma.$executeRaw`PRAGMA foreign_keys = ON`
      console.log('🔒 Foreign key constraints re-enabled')
    } catch (error) {
      console.log('ℹ️ Could not re-enable foreign keys (might be PostgreSQL):', error instanceof Error ? error.message : error)
    }
    
    // Reset auto-increment counters (SQLite specific)
    try {
      const tablesWithAutoIncrement = await prisma.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND sql LIKE '%AUTOINCREMENT%'
        AND name NOT LIKE 'sqlite_%'
        AND name NOT LIKE '_prisma_migrations'
      `
      
      for (const table of tablesWithAutoIncrement as any[]) {
        const tableName = table.name
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name = '${tableName}'`)
          console.log(`🔄 Reset auto-increment for table: ${tableName}`)
        } catch (error) {
          console.warn(`⚠️ Warning: Could not reset auto-increment for table ${tableName}:`, error instanceof Error ? error.message : error)
        }
      }
    } catch (error) {
      console.log('ℹ️ Could not reset auto-increment (might be PostgreSQL):', error instanceof Error ? error.message : error)
    }

    // Vacuum the database to optimize space (SQLite specific)
    try {
      console.log('🔧 Optimizing database...')
      await prisma.$executeRaw`VACUUM`
      console.log('✅ Database optimization completed')
    } catch (error) {
      console.log('ℹ️ Could not vacuum database (might be PostgreSQL):', error instanceof Error ? error.message : error)
    }

    const duration = Date.now() - startTime
    console.log(`✅ Database cleaning completed successfully!`)
    console.log(`📊 Summary: ${cleanedCount} tables cleaned, ${failedCount} failed`)
    console.log(`⏱️ Duration: ${duration}ms`)
    
  } catch (error) {
    console.error('❌ Error during database cleaning:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace available')
    throw error
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  }
}

// Execute the cleaning function
cleanDatabase()
  .then(() => {
    console.log('🎉 Database cleaning process finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Database cleaning failed:', error)
    process.exit(1)
  })