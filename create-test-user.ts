import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Create test admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@elhamd.com' }
    })

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          name: 'أحمد محمد',
          email: 'admin@elhamd.com',
          password: hashedPassword,
          phone: '+966501234567',
          isActive: true,
          role: UserRole.ADMIN
        }
      })
      
      console.log('Test user created:', user.email)
    } else {
      console.log('Test user already exists:', existingUser.email)
    }

  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()