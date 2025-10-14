import { db } from '../src/lib/db'

async function updateVehicleImages() {
  console.log('Updating vehicle images...')

  // Define the correct image paths for each vehicle
  const vehicleImageUpdates = [
    {
      stockNumber: 'TNX001',
      images: [
        { imageUrl: '/uploads/vehicles/1/nexon-front-new.jpg', altText: 'تاتا نيكسون أمامية', isPrimary: true, order: 1 },
        { imageUrl: '/uploads/vehicles/1/nexon-side-new.jpg', altText: 'تاتا نيكسون جانبية', isPrimary: false, order: 2 },
        { imageUrl: '/uploads/vehicles/1/nexon-front.jpg', altText: 'تاتا نيكسون خلفية', isPrimary: false, order: 3 }
      ]
    },
    {
      stockNumber: 'TPC002',
      images: [
        { imageUrl: '/uploads/vehicles/2/punch-front-new.jpg', altText: 'تاتا بانش أمامية', isPrimary: true, order: 1 },
        { imageUrl: '/uploads/vehicles/2/punch-front.jpg', altText: 'تاتا بانش جانبية', isPrimary: false, order: 2 }
      ]
    },
    {
      stockNumber: 'TTG003',
      images: [
        { imageUrl: '/uploads/vehicles/3/tiago-front-new.jpg', altText: 'تاتا تياجو أمامية', isPrimary: true, order: 1 },
        { imageUrl: '/uploads/vehicles/3/tiago-front.jpg', altText: 'تاتا تياجو داخلية', isPrimary: false, order: 2 }
      ]
    },
    {
      stockNumber: 'THR004',
      images: [
        { imageUrl: '/uploads/vehicles/5/harrier-front.jpg', altText: 'تاتا هاريير أمامية', isPrimary: true, order: 1 },
        { imageUrl: '/uploads/vehicles/5/harrier-front.jpg', altText: 'تاتا هاريير جانبية', isPrimary: false, order: 2 }
      ]
    },
    {
      stockNumber: 'TAL005',
      images: [
        { imageUrl: '/uploads/vehicles/6/altroz-front.jpg', altText: 'تاتا ألتروز أمامية', isPrimary: true, order: 1 }
      ]
    },
    {
      stockNumber: 'TIG006',
      images: [
        { imageUrl: '/uploads/vehicles/4/tigor-front.jpg', altText: 'تاتا تيغور أمامية', isPrimary: true, order: 1 }
      ]
    }
  ]

  for (const vehicleUpdate of vehicleImageUpdates) {
    try {
      // Find the vehicle by stock number
      const vehicle = await db.vehicle.findFirst({
        where: { stockNumber: vehicleUpdate.stockNumber }
      })

      if (!vehicle) {
        console.log(`Vehicle with stock number ${vehicleUpdate.stockNumber} not found`)
        continue
      }

      console.log(`Updating images for vehicle ${vehicleUpdate.stockNumber}...`)

      // Delete existing images
      await db.vehicleImage.deleteMany({
        where: { vehicleId: vehicle.id }
      })

      // Add new images
      for (const imageData of vehicleUpdate.images) {
        await db.vehicleImage.create({
          data: {
            vehicleId: vehicle.id,
            imageUrl: imageData.imageUrl,
            altText: imageData.altText,
            isPrimary: imageData.isPrimary,
            order: imageData.order
          }
        })
      }

      console.log(`Successfully updated images for vehicle ${vehicleUpdate.stockNumber}`)
    } catch (error) {
      console.error(`Error updating vehicle ${vehicleUpdate.stockNumber}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log('Vehicle images update completed!')
}

updateVehicleImages()
  .catch((error) => {
    console.error('Error updating vehicle images:', error instanceof Error ? error.message : error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })