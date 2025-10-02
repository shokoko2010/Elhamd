import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function quickSeed() {
  try {
    console.log('🌱 Creating admin user...')

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@elhamdimports.com',
        password: hashedPassword,
        name: 'أحمد محمد',
        role: 'ADMIN',
        phone: '+20 10 1234 5678',
        isActive: true,
        emailVerified: true,
        segment: 'VIP',
        status: 'active',
      }
    })

    console.log('✅ Admin user created successfully')
    console.log(`Email: ${admin.email}`)
    console.log(`Password: admin123`)

  } catch (error) {
    console.error('❌ Error creating admin user:', error instanceof Error ? error.message : error)
  } finally {
    await prisma.$disconnect()
  }
}

quickSeed()