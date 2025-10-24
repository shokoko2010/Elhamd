#!/usr/bin/env tsx

/**
 * Database Cleaning Script for Vercel Builds
 * 
 * This script cleans the database before a new build on Vercel.
 * It removes all data while preserving the schema structure.
 * Supports both SQLite and PostgreSQL databases.
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

    // Detect database type
    let isPostgreSQL = false
    let isSQLite = false
    
    try {
      // Try to get database info to determine the type
      const databaseUrl = process.env.DATABASE_URL || ''
      if (databaseUrl.includes('postgresql') || databaseUrl.includes('postgres')) {
        isPostgreSQL = true
        console.log('🐘 PostgreSQL database detected')
      } else if (databaseUrl.includes('sqlite') || databaseUrl.includes('file:')) {
        isSQLite = true
        console.log('🗄️ SQLite database detected')
      } else {
        // Try a PostgreSQL-specific query to detect
        await prisma.$queryRaw`SELECT version()`
        isPostgreSQL = true
        console.log('🐘 PostgreSQL database detected (via query)')
      }
    } catch (error) {
      // If PostgreSQL query fails, assume SQLite
      isSQLite = true
      console.log('🗄️ SQLite database detected (via fallback)')
    }

    // Get all table names from the database (excluding system tables)
    let tables: any[] = []
    
    if (isPostgreSQL) {
      // PostgreSQL query to get user tables
      tables = await prisma.$queryRaw`
        SELECT table_name as name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma_%'
        ORDER BY table_name
      `
    } else {
      // SQLite query to get user tables
      tables = await prisma.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%' 
        AND name NOT LIKE '_prisma_migrations'
        AND name NOT LIKE 'pg_%'
        ORDER BY name
      `
    }
    
    console.log(`📋 Found ${tables.length} tables to clean`)
    
    if (tables.length === 0) {
      console.log('ℹ️ No tables found to clean')
      await prisma.$disconnect()
      process.exit(0)
    }

    // Log table names for debugging
    console.log('📝 Tables to clean:', tables.map(t => t.name).join(', '))

    // Handle foreign key constraints and cleaning based on database type
    if (isPostgreSQL) {
      console.log('🔧 Disabling foreign key constraints for PostgreSQL...')
      
      // Disable foreign key constraints for PostgreSQL
      await prisma.$executeRaw`SET session_replication_role = replica;`
      console.log('🔓 Foreign key constraints disabled (PostgreSQL)')
      
      // Clean each table
      let cleanedCount = 0
      let failedCount = 0
      
      for (const table of tables) {
        const tableName = table.name
        console.log(`🗑️ Cleaning table: ${tableName}`)
        
        try {
          // Get row count before cleaning
          const countResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`)
          const rowCount = (countResult as any[])[0]?.count || 0
          
          if (rowCount > 0) {
            // Use TRUNCATE for PostgreSQL (faster and resets sequences)
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`)
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
      
      // Re-enable foreign key constraints
      await prisma.$executeRaw`SET session_replication_role = DEFAULT;`
      console.log('🔒 Foreign key constraints re-enabled (PostgreSQL)')
      
      const duration = Date.now() - startTime
      console.log(`✅ PostgreSQL database cleaning completed successfully!`)
      console.log(`📊 Summary: ${cleanedCount} tables cleaned, ${failedCount} failed`)
      console.log(`⏱️ Duration: ${duration}ms`)
      
    } else {
      // SQLite handling
      try {
        await prisma.$executeRaw`PRAGMA foreign_keys = OFF`
        console.log('🔓 Foreign key constraints disabled (SQLite)')
      } catch (error) {
        console.log('ℹ️ Could not disable foreign keys:', error instanceof Error ? error.message : error)
      }
      
      // Clean each table with better error handling
      let cleanedCount = 0
      let failedCount = 0
      
      for (const table of tables) {
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
        console.log('🔒 Foreign key constraints re-enabled (SQLite)')
      } catch (error) {
        console.log('ℹ️ Could not re-enable foreign keys:', error instanceof Error ? error.message : error)
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
        console.log('ℹ️ Could not reset auto-increment:', error instanceof Error ? error.message : error)
      }

      // Vacuum the database to optimize space (SQLite specific)
      try {
        console.log('🔧 Optimizing database...')
        await prisma.$executeRaw`VACUUM`
        console.log('✅ Database optimization completed')
      } catch (error) {
        console.log('ℹ️ Could not vacuum database:', error instanceof Error ? error.message : error)
      }

      const duration = Date.now() - startTime
      console.log(`✅ SQLite database cleaning completed successfully!`)
      console.log(`📊 Summary: ${cleanedCount} tables cleaned, ${failedCount} failed`)
      console.log(`⏱️ Duration: ${duration}ms`)
    }
    
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