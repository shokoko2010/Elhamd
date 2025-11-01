// Quick seed script to create admin users
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUsers() {
  try {
    console.log('🔧 Creating admin users...')

    // Create or update admin users
    const users = [
      {
        email: 'admin@elhamdimport.online',
        name: 'مدير النظام',
        password: 'admin123',
        role: 'SUPER_ADMIN',
        phone: '+20 1012345678'
      },
      {
        email: 'manager@elhamdimport.online',
        name: 'مدير الفرع',
        password: 'manager123',
        role: 'BRANCH_MANAGER',
        phone: '+20 1023456789'
      },
      {
        email: 'sales.manager@elhamdimport.online',
        name: 'مدير المبيعات',
        password: 'salesmanager123',
        role: 'STAFF',
        phone: '+20 1034567890'
      },
      {
        email: 'service.manager@elhamdimport.online',
        name: 'مدير الخدمة',
        password: 'servicemanager123',
        role: 'STAFF',
        phone: '+20 1045678901'
      }
    ]

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          phone: userData.phone,
          isActive: true,
          emailVerified: true
        },
        create: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          phone: userData.phone,
          isActive: true,
          emailVerified: true
        }
      })
      
      console.log(`✓ Created/updated user: ${userData.email}`)
    }

    console.log('✅ Admin users created successfully!')
  } catch (error) {
    console.error('❌ Error creating admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUsers()