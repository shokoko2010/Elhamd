import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

// Generate secure random passwords
function generateSecurePassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

async function createSecureAdminUsers() {
  try {
    console.log('Creating secure admin users...')
    
    // Check if any admin exists
    const existingAdmin = await db.user.findFirst({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      }
    })

    if (existingAdmin) {
      console.log('Admin users already exist. Skipping creation.')
      return
    }

    // Create SUPER_ADMIN with secure password
    const superAdminPassword = generateSecurePassword()
    const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 12)
    
    const superAdmin = await db.user.create({
      data: {
        email: 'admin@elhamdimport.com',
        name: 'Super Admin',
        password: hashedSuperAdminPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true
      }
    })

    console.log('=== SUPER ADMIN CREATED ===')
    console.log('Email:', superAdmin.email)
    console.log('Password:', superAdminPassword)
    console.log('IMPORTANT: Save this password securely and change it after first login!')
    console.log('=============================')

    // Create additional admin users with secure passwords
    const adminUsers = [
      {
        email: 'manager@elhamdimport.com',
        name: 'Branch Manager',
        role: 'BRANCH_MANAGER' as const,
        password: generateSecurePassword()
      },
      {
        email: 'sales@elhamdimport.com',
        name: 'Sales Manager',
        role: 'ADMIN' as const,
        password: generateSecurePassword()
      }
    ]

    for (const adminUser of adminUsers) {
      const hashedPassword = await bcrypt.hash(adminUser.password, 12)
      
      await db.user.create({
        data: {
          email: adminUser.email,
          name: adminUser.name,
          password: hashedPassword,
          role: adminUser.role,
          isActive: true,
          emailVerified: true
        }
      })

      console.log(`=== ${adminUser.role} CREATED ===`)
      console.log('Email:', adminUser.email)
      console.log('Password:', adminUser.password)
      console.log('=============================')
    }

    console.log('Secure admin users created successfully!')
    
  } catch (error) {
    console.error('Error creating admin users:', error)
  } finally {
    await db.$disconnect()
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  createSecureAdminUsers()
}

export { createSecureAdminUsers, generateSecurePassword }