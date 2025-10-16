const { PrismaClient, VehicleCategory, FuelType, TransmissionType, VehicleSpecCategory } = require('@prisma/client')

const prisma = new PrismaClient()

async function createFeaturedVehicle() {
  try {
    console.log('Creating featured vehicle...')
    
    // Create a featured vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'Tata',
        model: 'Nexon EV',
        year: 2024,
        price: 650000,
        stockNumber: 'NEXON-001',
        vin: 'MAT62345678901234',
        description: 'سيارة كهربائية مميزة بتقنية متطورة وتصميم عصري',
        category: VehicleCategory.SUV,
        fuelType: FuelType.ELECTRIC,
        transmission: TransmissionType.AUTOMATIC,
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        featured: true,
        images: {
          create: [
            {
              imageUrl: '/uploads/vehicles/1/nexon-front.jpg',
              altText: 'Tata Nexon EV Front View',
              isPrimary: true,
              order: 0
            },
            {
              imageUrl: '/uploads/vehicles/1/nexon-side.jpg',
              altText: 'Tata Nexon EV Side View',
              isPrimary: false,
              order: 1
            }
          ]
        },
        specifications: {
          create: [
            {
              key: 'engine',
              label: 'المحرك',
              value: 'كهربائي',
              category: VehicleSpecCategory.ENGINE
            },
            {
              key: 'power',
              label: 'القدرة الحصانية',
              value: '127 حصان',
              category: VehicleSpecCategory.ENGINE
            },
            {
              key: 'range',
              label: 'مدى السير',
              value: '312 كم',
              category: VehicleSpecCategory.TECHNOLOGY
            },
            {
              key: 'seats',
              label: 'عدد المقاعد',
              value: '5',
              category: VehicleSpecCategory.INTERIOR
            }
          ]
        },
        pricing: {
          create: {
            basePrice: 650000,
            totalPrice: 650000,
            currency: 'EGP',
            hasDiscount: false
          }
        }
      }
    })
    
    console.log('✅ Featured vehicle created successfully:', vehicle.id)
    
    // Create another featured vehicle
    const vehicle2 = await prisma.vehicle.create({
      data: {
        make: 'Tata',
        model: 'Punch',
        year: 2024,
        price: 380000,
        stockNumber: 'PUNCH-001',
        vin: 'MAT62345678901235',
        description: 'سيارة مدمجة عملية مثالية للمدينة',
        category: VehicleCategory.HATCHBACK,
        fuelType: FuelType.PETROL,
        transmission: TransmissionType.MANUAL,
        mileage: 0,
        color: 'أحمر',
        status: 'AVAILABLE',
        featured: true,
        images: {
          create: [
            {
              imageUrl: '/uploads/vehicles/2/punch-front.jpg',
              altText: 'Tata Punch Front View',
              isPrimary: true,
              order: 0
            }
          ]
        },
        specifications: {
          create: [
            {
              key: 'engine',
              label: 'المحرك',
              value: '1.2L بنزين',
              category: VehicleSpecCategory.ENGINE
            },
            {
              key: 'power',
              label: 'القدرة الحصانية',
              value: '85 حصان',
              category: VehicleSpecCategory.ENGINE
            },
            {
              key: 'seats',
              label: 'عدد المقاعد',
              value: '5',
              category: VehicleSpecCategory.INTERIOR
            }
          ]
        },
        pricing: {
          create: {
            basePrice: 380000,
            totalPrice: 380000,
            currency: 'EGP',
            hasDiscount: false
          }
        }
      }
    })
    
    console.log('✅ Second featured vehicle created successfully:', vehicle2.id)
    
  } catch (error) {
    console.error('❌ Error creating featured vehicles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createFeaturedVehicle()