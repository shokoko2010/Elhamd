import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    const userCount = await prisma.user.count()
    console.log('Database connection successful. User count:', userCount)
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@elhamd.com' }
    })
    console.log('Found user:', user?.email || 'Not found')
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()