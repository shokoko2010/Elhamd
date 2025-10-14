import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateVehicleImages() {
  console.log('🖼️ Updating vehicle images...')
  
  try {
    const vehicles = await prisma.vehicle.findMany()
    
    for (const vehicle of vehicles) {
      const imageUrl = `/uploads/vehicles/${vehicle.model.replace(/\s+/g, '-')}-1.jpg`
      
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          images: {
            create: [
              {
                imageUrl: imageUrl,
                isPrimary: true,
                alt: `${vehicle.make} ${vehicle.model} - Image 1`
              }
            ]
          }
        }
      })
      
      console.log(`✅ Updated images for ${vehicle.model}`)
    }
    
    console.log('✅ All vehicle images updated successfully!')
  } catch (error) {
    console.error('❌ Error updating vehicle images:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateVehicleImages()