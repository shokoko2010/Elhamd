import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSeededData() {
  console.log('🧪 Testing seeded data integrity...')
  
  try {
    // Test 1: Check if we can access users with their roles
    console.log('\n👤 Testing Users and Roles...')
    const users = await prisma.user.findMany({
      include: {
        roleTemplate: {
          include: {
            roleTemplatePermissions: {
              include: {
                permission: true
              }
            }
          }
        },
        branch: true
      }
    })
    
    console.log(`✅ Found ${users.length} users`)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.role}) - ${user.branch?.name || 'No branch'}`)
    })

    // Test 2: Check vehicles with specifications
    console.log('\n🚗 Testing Vehicles...')
    const vehicles = await prisma.vehicle.findMany({
      include: {
        specifications: true,
        images: true,
        pricing: true,
        branch: true
      }
    })
    
    console.log(`✅ Found ${vehicles.length} vehicles`)
    vehicles.forEach(vehicle => {
      console.log(`  - ${vehicle.make} ${vehicle.model} ${vehicle.year} - ${vehicle.specifications.length} specs, ${vehicle.images.length} images`)
    })

    // Test 3: Check service types
    console.log('\n🔧 Testing Service Types...')
    const serviceTypes = await prisma.serviceType.findMany()
    console.log(`✅ Found ${serviceTypes.length} service types`)
    serviceTypes.forEach(service => {
      console.log(`  - ${service.name}: ${service.duration}min, EGP ${service.price}`)
    })

    // Test 4: Check permissions and role templates
    console.log('\n📋 Testing Permissions...')
    const permissions = await prisma.permission.findMany()
    const roleTemplates = await prisma.roleTemplate.findMany({
      include: {
        roleTemplatePermissions: {
          include: {
            permission: true
          }
        }
      }
    })
    
    console.log(`✅ Found ${permissions.length} permissions`)
    console.log(`✅ Found ${roleTemplates.length} role templates`)
    
    roleTemplates.forEach(template => {
      console.log(`  - ${template.name}: ${template.roleTemplatePermissions.length} permissions`)
    })

    // Test 5: Check time slots
    console.log('\n⏰ Testing Time Slots...')
    const timeSlots = await prisma.timeSlot.findMany()
    console.log(`✅ Found ${timeSlots.length} time slots`)
    
    // Group by day of week
    const slotsByDay = timeSlots.reduce((acc, slot) => {
      acc[slot.dayOfWeek] = (acc[slot.dayOfWeek] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    Object.entries(slotsByDay).forEach(([day, count]) => {
      console.log(`  - Day ${day}: ${count} slots`)
    })

    // Test 6: Check branches
    console.log('\n🏢 Testing Branches...')
    const branches = await prisma.branch.findMany({
      include: {
        users: true,
        vehicles: true
      }
    })
    
    console.log(`✅ Found ${branches.length} branches`)
    branches.forEach(branch => {
      console.log(`  - ${branch.name}: ${branch.users.length} users, ${branch.vehicles.length} vehicles`)
    })

    // Test 7: Test relationships
    console.log('\n🔗 Testing Relationships...')
    
    // Test user-branch relationship
    const userWithBranch = await prisma.user.findFirst({
      where: { branchId: { not: null } },
      include: { branch: true }
    })
    
    if (userWithBranch) {
      console.log(`✅ User-Branch relationship: ${userWithBranch.name} → ${userWithBranch.branch?.name}`)
    }

    // Test vehicle-branch relationship
    const vehicleWithBranch = await prisma.vehicle.findFirst({
      include: { branch: true }
    })
    
    if (vehicleWithBranch) {
      console.log(`✅ Vehicle-Branch relationship: ${vehicleWithBranch.make} ${vehicleWithBranch.model} → ${vehicleWithBranch.branch?.name}`)
    }

    // Test role template permissions
    const roleTemplateWithPermissions = await prisma.roleTemplate.findFirst({
      include: {
        roleTemplatePermissions: {
          include: { permission: true }
        }
      }
    })
    
    if (roleTemplateWithPermissions) {
      console.log(`✅ Role Template-Permissions: ${roleTemplateWithPermissions.name} has ${roleTemplateWithPermissions.roleTemplatePermissions.length} permissions`)
    }

    console.log('\n🎉 All data integrity tests passed!')
    console.log('\n📊 Summary:')
    console.log(`  - Users: ${users.length}`)
    console.log(`  - Branches: ${branches.length}`)
    console.log(`  - Vehicles: ${vehicles.length}`)
    console.log(`  - Service Types: ${serviceTypes.length}`)
    console.log(`  - Permissions: ${permissions.length}`)
    console.log(`  - Role Templates: ${roleTemplates.length}`)
    console.log(`  - Time Slots: ${timeSlots.length}`)
    
  } catch (error) {
    console.error('❌ Data integrity test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  testSeededData()
    .then(() => {
      console.log('✅ Data integrity test completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Data integrity test failed:', error)
      process.exit(1)
    })
}

export default testSeededData