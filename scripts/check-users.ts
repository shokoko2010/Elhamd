import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })
    
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`)
    })
    
    const admin = users.find(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
    if (admin) {
      console.log(`\n✅ Admin user found: ${admin.email}`)
      return admin.id
    } else {
      console.log('\n❌ No admin user found')
      return null
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error instanceof Error ? error.message : error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()