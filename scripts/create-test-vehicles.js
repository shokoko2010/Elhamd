const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestVehicles() {
  try {
    console.log('Creating test vehicles...')

    // Check if branch exists
    let branch = await prisma.branch.findFirst()
    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          name: 'الفرع الرئيسي',
          code: 'MAIN',
          address: 'القاهرة، مصر',
          phone: '+20 2 12345678',
          email: 'info@elhamd.com',
          isActive: true,
          openingDate: new Date('2020-01-01'),
          currency: 'EGP',
          timezone: 'Africa/Cairo'
        }
      })
      console.log('Created default branch')
    }

    // Create test vehicles
    const vehicles = [
      {
        make: 'Tata Motors',
        model: 'Nexon EV',
        year: 2024,
        price: 850000,
        stockNumber: 'TAT-NEXON-001',
        vin: 'TATNEXON2024001',
        description: 'سيارة SUV كهربائية عصرية بأداء مميز',
        category: 'SUV',
        fuelType: 'ELECTRIC',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        featured: true,
        branchId: branch.id
      },
      {
        make: 'Tata Motors',
        model: 'Punch',
        year: 2024,
        price: 650000,
        stockNumber: 'TAT-PUNCH-001',
        vin: 'TATPUNCH2024001',
        description: 'سيارة هاتشباك مدمجة مثالية للمدينة',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أحمر',
        status: 'AVAILABLE',
        featured: false,
        branchId: branch.id
      },
      {
        make: 'Tata Motors',
        model: 'Harrier',
        year: 2024,
        price: 1100000,
        stockNumber: 'TAT-HARRIER-001',
        vin: 'TATHARRIER2024001',
        description: 'سيارة SUV فاخرة بمساحة واسعة',
        category: 'SUV',
        fuelType: 'DIESEL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أسود',
        status: 'RESERVED',
        featured: true,
        branchId: branch.id
      },
      {
        make: 'Tata Motors',
        model: 'Altroz',
        year: 2024,
        price: 720000,
        stockNumber: 'TAT-ALTROZ-001',
        vin: 'TATALTROZ2024001',
        description: 'سيارة هاتشباك عصرية بتصميم رياضي',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أزرق',
        status: 'AVAILABLE',
        featured: false,
        branchId: branch.id
      },
      {
        make: 'Tata Motors',
        model: 'Safari',
        year: 2024,
        price: 1250000,
        stockNumber: 'TAT-SAFARI-001',
        vin: 'TATSAFARI2024001',
        description: 'سيارة SUV عائلية بمحرك قوي',
        category: 'SUV',
        fuelType: 'DIESEL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'رمادي',
        status: 'SOLD',
        featured: true,
        branchId: branch.id
      }
    ]

    for (const vehicleData of vehicles) {
      // Check if vehicle already exists
      const existing = await prisma.vehicle.findUnique({
        where: { stockNumber: vehicleData.stockNumber }
      })

      if (!existing) {
        const vehicle = await prisma.vehicle.create({
          data: {
            ...vehicleData,
            pricing: {
              create: {
                basePrice: vehicleData.price,
                discountPrice: null,
                discountPercentage: null,
                taxes: 0,
                fees: 0,
                totalPrice: vehicleData.price,
                currency: 'EGP',
                hasDiscount: false,
                discountExpires: null
              }
            }
          }
        })
        console.log(`Created vehicle: ${vehicle.make} ${vehicle.model}`)
      } else {
        console.log(`Vehicle already exists: ${existing.make} ${existing.model}`)
      }
    }

    console.log('Test vehicles created successfully!')
  } catch (error) {
    console.error('Error creating test vehicles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestVehicles()