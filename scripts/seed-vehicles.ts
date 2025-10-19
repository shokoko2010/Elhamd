import { db } from '@/lib/db'
import { VehicleStatus, VehicleCategory, FuelType, TransmissionType } from '@prisma/client'

async function seedVehicles() {
  try {
    console.log('🚗 Starting vehicle seeding...')

    // Sample vehicles with proper image URLs
    const vehicles = [
      {
        make: 'Tata',
        model: 'Nexon',
        year: 2024,
        price: 450000,
        stockNumber: 'TNX001',
        vin: 'TATANXON2024001',
        description: 'سيارة SUV حديثة بميزات متقدمة',
        category: VehicleCategory.SUV,
        fuelType: FuelType.PETROL,
        transmission: TransmissionType.AUTOMATIC,
        mileage: 0,
        color: 'أبيض',
        status: VehicleStatus.AVAILABLE,
        featured: true,
        images: [
          {
            imageUrl: '/uploads/vehicles/tata-nexon-1.jpg',
            altText: 'Tata Nexon أمامي',
            isPrimary: true,
            order: 0
          },
          {
            imageUrl: '/uploads/vehicles/tata-nexon-2.jpg',
            altText: 'Tata Nexون جانبي',
            isPrimary: false,
            order: 1
          },
          {
            imageUrl: '/uploads/vehicles/tata-nexon-3.jpg',
            altText: 'Tata Nexon داخلي',
            isPrimary: false,
            order: 2
          }
        ]
      },
      {
        make: 'Tata',
        model: 'Punch',
        year: 2024,
        price: 350000,
        stockNumber: 'TPU001',
        vin: 'TATAPUNC2024001',
        description: 'سيارة مدمجة عملية وموفرة للوقود',
        category: VehicleCategory.HATCHBACK,
        fuelType: FuelType.PETROL,
        transmission: TransmissionType.MANUAL,
        mileage: 0,
        color: 'أحمر',
        status: VehicleStatus.AVAILABLE,
        featured: true,
        images: [
          {
            imageUrl: '/uploads/vehicles/tata-punch-1.jpg',
            altText: 'Tata Punch أمامي',
            isPrimary: true,
            order: 0
          },
          {
            imageUrl: '/uploads/vehicles/tata-punch-2.jpg',
            altText: 'Tata Punch جانبي',
            isPrimary: false,
            order: 1
          }
        ]
      },
      {
        make: 'Tata',
        model: 'Tiago',
        year: 2024,
        price: 280000,
        stockNumber: 'TTI001',
        vin: 'TATIAGO2024001',
        description: 'سيارة سيدان اقتصادية وعملية',
        category: VehicleCategory.SEDAN,
        fuelType: FuelType.PETROL,
        transmission: TransmissionType.MANUAL,
        mileage: 0,
        color: 'أزرق',
        status: VehicleStatus.AVAILABLE,
        featured: false,
        images: [
          {
            imageUrl: '/uploads/vehicles/tata-tiago-1.jpg',
            altText: 'Tata Tiago أمامي',
            isPrimary: true,
            order: 0
          },
          {
            imageUrl: '/uploads/vehicles/tata-tiago-2.jpg',
            altText: 'Tata Tiago خلفي',
            isPrimary: false,
            order: 1
          }
        ]
      },
      {
        make: 'Tata',
        model: 'Harrier',
        year: 2024,
        price: 550000,
        stockNumber: 'THA001',
        vin: 'TATAHAR2024001',
        description: 'سيارة SUV عائلية spacious ومريحة',
        category: VehicleCategory.SUV,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.AUTOMATIC,
        mileage: 0,
        color: 'أسود',
        status: VehicleStatus.AVAILABLE,
        featured: true,
        images: [
          {
            imageUrl: '/uploads/vehicles/tata-harrier-1.jpg',
            altText: 'Tata Harrier أمامي',
            isPrimary: true,
            order: 0
          },
          {
            imageUrl: '/uploads/vehicles/tata-harrier-2.jpg',
            altText: 'Tata Harrier جانبي',
            isPrimary: false,
            order: 1
          },
          {
            imageUrl: '/uploads/vehicles/tata-harrier-3.jpg',
            altText: 'Tata Harrier داخلي',
            isPrimary: false,
            order: 2
          }
        ]
      },
      {
        make: 'Tata',
        model: 'Altroz',
        year: 2024,
        price: 320000,
        stockNumber: 'TAL001',
        vin: 'TATAALT2024001',
        description: 'هايتشباك أنيقة ومتطورة',
        category: VehicleCategory.HATCHBACK,
        fuelType: FuelType.PETROL,
        transmission: TransmissionType.MANUAL,
        mileage: 0,
        color: 'رمادي',
        status: VehicleStatus.AVAILABLE,
        featured: false,
        images: [
          {
            imageUrl: '/uploads/vehicles/tata-altroz-1.jpg',
            altText: 'Tata Altroz أمامي',
            isPrimary: true,
            order: 0
          },
          {
            imageUrl: '/uploads/vehicles/tata-altroz-2.jpg',
            altText: 'Tata Altroz جانبي',
            isPrimary: false,
            order: 1
          }
        ]
      },
      {
        make: 'Tata',
        model: 'Safari',
        year: 2024,
        price: 650000,
        stockNumber: 'TSA001',
        vin: 'TATASAF2024001',
        description: 'SUV كبيرة وملكية للعائلات',
        category: VehicleCategory.SUV,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.AUTOMATIC,
        mileage: 0,
        color: 'فضي',
        status: VehicleStatus.AVAILABLE,
        featured: true,
        images: [
          {
            imageUrl: '/uploads/vehicles/tata-safari-1.jpg',
            altText: 'Tata Safari أمامي',
            isPrimary: true,
            order: 0
          },
          {
            imageUrl: '/uploads/vehicles/tata-safari-2.jpg',
            altText: 'Tata Safari جانبي',
            isPrimary: false,
            order: 1
          },
          {
            imageUrl: '/uploads/vehicles/tata-safari-3.jpg',
            altText: 'Tata Safari داخلي',
            isPrimary: false,
            order: 2
          }
        ]
      }
    ]

    // Insert vehicles
    for (const vehicleData of vehicles) {
      const { images, ...vehicleInfo } = vehicleData
      
      // Check if vehicle already exists
      const existingVehicle = await db.vehicle.findFirst({
        where: { stockNumber: vehicleInfo.stockNumber }
      })

      if (!existingVehicle) {
        const vehicle = await db.vehicle.create({
          data: vehicleInfo
        })

        // Insert images
        for (const imageData of images) {
          await db.vehicleImage.create({
            data: {
              ...imageData,
              vehicleId: vehicle.id
            }
          })
        }

        console.log(`✅ Created vehicle: ${vehicle.make} ${vehicle.model}`)
      } else {
        console.log(`⚠️ Vehicle already exists: ${vehicleInfo.make} ${vehicleInfo.model}`)
      }
    }

    console.log('🎉 Vehicle seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding vehicles:', error)
  } finally {
    await db.$disconnect()
  }
}

seedVehicles()