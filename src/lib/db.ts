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
    }
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Test database connection
async function testConnection() {
  try {
    await db.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

// Test connection in development
if (process.env.NODE_ENV === 'development') {
  testConnection()
}

// Handle connection cleanup for serverless environments
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await db.$disconnect()
  })
}

// Export prisma instance for backward compatibility
export { PrismaClient }
export const prisma = db