import { db } from './lib/db'
import bcrypt from 'bcryptjs'

async function createTestUser() {
  try {
    console.log('Creating test user...')
    
    // Check if admin user already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@elhamdimport.com' }
    })
    
    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Create admin user
    const adminUser = await db.user.create({
      data: {
        email: 'admin@elhamdimport.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true
      }
    })
    
    console.log('Admin user created:', adminUser.email)
    
    // Create a test branch
    const existingBranch = await db.branch.findFirst()
    if (!existingBranch) {
      const branch = await db.branch.create({
        data: {
          name: 'الرياض - الفرع الرئيسي',
          code: 'RYD-001',
          address: 'الرياض، المملكة العربية السعودية',
          phone: '+966 50 123 4567',
          email: 'riyadh@elhamdimport.com',
          isActive: true,
          openingDate: new Date(),
          currency: 'SAR',
          timezone: 'Asia/Riyadh'
        }
      })
      
      console.log('Test branch created:', branch.name)
      
      // Update admin user with branch
      await db.user.update({
        where: { id: adminUser.id },
        data: { branchId: branch.id }
      })
      
      console.log('Admin user assigned to branch')
    }
    
    console.log('Test data creation completed!')
    
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await db.$disconnect()
  }
}

createTestUser()