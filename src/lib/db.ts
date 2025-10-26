import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Handle connection cleanup for serverless environments
process.on('beforeExit', async () => {
  await db.$disconnect()
})

// Export prisma instance for backward compatibility
export { PrismaClient }
export const prisma = db