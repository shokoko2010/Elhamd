import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || process.env.POSTGRES_URL || "file:./dev.db"
      }
    },
    // Add connection timeout and retry settings for production
    __internal: {
      engine: {
        connectionTimeout: 10000, // 10 seconds
        queryTimeout: 30000, // 30 seconds
      }
    }
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Enhanced test database connection with retry logic
async function testConnection() {
  const maxRetries = 3
  let retryCount = 0
  
  while (retryCount < maxRetries) {
    try {
      await db.$connect()
      console.log('✅ Database connected successfully')
      return true
    } catch (error) {
      console.error(`❌ Database connection attempt ${retryCount + 1} failed:`, error)
      retryCount++
      
      if (retryCount >= maxRetries) {
        console.error('❌ All database connection attempts failed')
        return false
      }
      
      // Wait before retry with exponential backoff
      const delay = Math.pow(2, retryCount) * 1000
      console.log(`🔄 Retrying database connection in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return false
}

// Test connection in all environments
testConnection()

// Enhanced connection cleanup for serverless environments
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    try {
      await db.$disconnect()
      console.log('✅ Database disconnected successfully')
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error)
    }
  })
  
  process.on('SIGINT', async () => {
    try {
      await db.$disconnect()
      console.log('✅ Database disconnected successfully (SIGINT)')
      process.exit(0)
    } catch (error) {
      console.error('❌ Error disconnecting from database (SIGINT):', error)
      process.exit(1)
    }
  })
  
  process.on('SIGTERM', async () => {
    try {
      await db.$disconnect()
      console.log('✅ Database disconnected successfully (SIGTERM)')
      process.exit(0)
    } catch (error) {
      console.error('❌ Error disconnecting from database (SIGTERM):', error)
      process.exit(1)
    }
  })
}

// Export prisma instance for backward compatibility
export { PrismaClient }
export const prisma = db

// Helper function to execute database operations with retry logic
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let retryCount = 0
  
  while (retryCount < maxRetries) {
    try {
      return await operation()
    } catch (error) {
      retryCount++
      
      if (retryCount >= maxRetries) {
        console.error(`❌ Operation failed after ${maxRetries} attempts:`, error)
        throw error
      }
      
      // Check if error is retryable
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : ''
      const isRetryable = errorMessage.includes('connection') || 
                         errorMessage.includes('timeout') || 
                         errorMessage.includes('econnrefused') ||
                         errorMessage.includes('database')
      
      if (!isRetryable) {
        console.error('❌ Non-retryable error:', error)
        throw error
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, retryCount - 1)
      console.log(`🔄 Retrying operation in ${delay}ms (attempt ${retryCount}/${maxRetries})...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new Error('Operation failed after all retries')
}