import { PrismaClient, VehicleCategory, VehicleStatus, FuelType, TransmissionType } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSimpleVehicles() {
  console.log('🚗 Seeding vehicles...')
  
  try {
    const vehicles = [
      {
        make: 'Tata Motors',
        model: 'PRIMA 3328.K',
        year: 2024,
        price: 2850000,
        stockNumber: 'TM-PRIMA-3328K-001',
        category: VehicleCategory.COMMERCIAL,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.MANUAL,
        status: VehicleStatus.AVAILABLE,
        featured: true,
        description: 'شاحنة Tata Motors Prima 3328.K بقوة 269 حصان وعزم دوران 970 نيوتن.متر، مصممة لأصعب المهام'
      },
      {
        make: 'Tata Motors',
        model: 'LP 613',
        year: 2024,
        price: 1850000,
        stockNumber: 'TM-LP-613-001',
        category: VehicleCategory.COMMERCIAL,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.MANUAL,
        status: VehicleStatus.AVAILABLE,
        featured: true,
        description: 'حافلة تاتا LP 613 بمحرك 130 حصان، مثالية لتنقلات الموظفين والمدارس والرحلات'
      },
      {
        make: 'Tata Motors',
        model: 'ULTRA T.9',
        year: 2024,
        price: 1250000,
        stockNumber: 'TM-ULTRA-T9-001',
        category: VehicleCategory.COMMERCIAL,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.MANUAL,
        status: VehicleStatus.AVAILABLE,
        featured: true,
        description: 'شاحنة Tata Ultra T.9 بمحرك 155 حصان وتقنية متقدمة للنقل والخدمات اللوجستية'
      },
      {
        make: 'Tata Motors',
        model: 'XENON SC',
        year: 2024,
        price: 650000,
        stockNumber: 'TM-XENON-SC-001',
        category: VehicleCategory.TRUCK,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.MANUAL,
        status: VehicleStatus.AVAILABLE,
        featured: true,
        description: 'تاتا زينون X2 SC بمحرك 150 حصان، تجمع بين القوة والمتانة للأعمال التجارية'
      }
    ]

    for (const vehicle of vehicles) {
      const createdVehicle = await prisma.vehicle.create({
        data: {
          ...vehicle,
          images: {
            create: [
              {
                imageUrl: `/uploads/vehicles/${vehicle.model.replace(/\s+/g, '-')}-1.jpg`,
                isPrimary: true,
                altText: `${vehicle.make} ${vehicle.model} - Image 1`,
                order: 0
              }
            ]
          }
        }
      })
      console.log(`✅ Created vehicle: ${createdVehicle.make} ${createdVehicle.model}`)
    }

    console.log('✅ Vehicles seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding vehicles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedSimpleVehicles()