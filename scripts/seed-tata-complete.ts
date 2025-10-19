import { PrismaClient } from '@prisma/client'
import { db } from '../src/lib/db'
import { seedTataCommercialVehicles } from './seed-tata-commercial-vehicles'
import { setupTataVehiclesPermissions } from './setup-tata-vehicles-permissions'

async function seedTataComplete() {
  console.log('🚀 Starting complete Tata Motors data seeding...')
  
  try {
    // Step 1: Setup permissions first
    console.log('\\n📋 Step 1: Setting up permissions...')
    await setupTataVehiclesPermissions()
    
    // Step 2: Seed vehicles
    console.log('\\n🚛 Step 2: Seeding commercial vehicles...')
    await seedTataCommercialVehicles()
    
    // Step 3: Verify data
    console.log('\\n🔍 Step 3: Verifying seeded data...')
    
    const vehicleCount = await db.vehicle.count({
      where: { make: 'Tata Motors' }
    })
    
    const specificationCount = await db.vehicleSpecification.count({
      where: {
        vehicle: {
          make: 'Tata Motors'
        }
      }
    })
    
    const imageCount = await db.vehicleImage.count({
      where: {
        vehicle: {
          make: 'Tata Motors'
        }
      }
    })
    
    const permissionCount = await db.permission.count({
      where: { category: 'VEHICLE_MANAGEMENT' }
    })
    
    console.log(`\\n📊 Seeding Summary:`)
    console.log(`   • Tata Vehicles: ${vehicleCount}`)
    console.log(`   • Specifications: ${specificationCount}`)
    console.log(`   • Images: ${imageCount}`)
    console.log(`   • Vehicle Permissions: ${permissionCount}`)
    
    console.log('\\n🎉 Complete Tata Motors seeding finished successfully!')
    
  } catch (error) {
    console.error('❌ Error in complete Tata seeding:', error)
    throw error
  }
}

// Run seed function if called directly
if (require.main === module) {
  seedTataComplete()
    .then(() => {
      console.log('✅ Complete seeding finished successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Complete seeding failed:', error)
      process.exit(1)
    })
}

export { seedTataComplete }