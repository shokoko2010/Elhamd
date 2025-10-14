import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 Checking database contents...')
  
  try {
    // Check vehicles
    const vehicles = await prisma.vehicle.findMany({
      include: {
        images: true
      }
    })
    console.log(`📊 Found ${vehicles.length} vehicles`)
    
    // Check sliders
    const sliders = await prisma.slider.findMany()
    console.log(`🎠 Found ${sliders.length} sliders`)
    
    // Check service items
    const services = await prisma.serviceItem.findMany()
    console.log(`🔧 Found ${services.length} service items`)
    
    // Show first vehicle details
    if (vehicles.length > 0) {
      const firstVehicle = vehicles[0]
      console.log(`🚗 First vehicle: ${firstVehicle.make} ${firstVehicle.model}`)
      console.log(`📸 Images: ${firstVehicle.images.length}`)
      console.log(`💰 Price: ${firstVehicle.price}`)
      console.log(`⭐ Featured: ${firstVehicle.featured}`)
    }
    
    // Show first slider details
    if (sliders.length > 0) {
      const firstSlider = sliders[0]
      console.log(`🎠 First slider: ${firstSlider.title}`)
      console.log(`🖼️ Image: ${firstSlider.imageUrl}`)
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()