import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting extended database seeding...')

  // Add additional data to existing database
  await seedVehicleImages()
  await seedVehicleSpecifications()
  await seedVehiclePricing()
  await seedServiceTypes()
  await seedTestDriveBookings()
  await seedServiceBookings()

  console.log('✅ Extended database seeding completed successfully!')
}

async function seedVehicleImages() {
  console.log('🖼️ Seeding vehicle images...')

  const vehicles = await prisma.vehicle.findMany()

  const vehicleImages = [
    // Nexon images
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      imageUrl: '/uploads/vehicles/tata-nexon-1.jpg',
      altText: 'تاتا نيكسون - جانب',
      isPrimary: true,
      order: 1
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      imageUrl: '/uploads/vehicles/tata-nexon-2.jpg',
      altText: 'تاتا نيكسون - أمامي',
      isPrimary: false,
      order: 2
    },
    // Punch images
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      imageUrl: '/uploads/vehicles/tata-punch-1.jpg',
      altText: 'تاتا بنش - أمامي',
      isPrimary: true,
      order: 1
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      imageUrl: '/uploads/vehicles/tata-punch-2.jpg',
      altText: 'تاتا بنش - جانب',
      isPrimary: false,
      order: 2
    },
    // Tiago images
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      imageUrl: '/uploads/vehicles/tata-tiago-1.jpg',
      altText: 'تاتا تياجو - أمامي',
      isPrimary: true,
      order: 1
    },
    // Altroz images
    {
      vehicleId: vehicles.find(v => v.model === 'Altroz')?.id || '',
      imageUrl: '/uploads/vehicles/tata-altroz-1.jpg',
      altText: 'تاتا ألتروز - أمامي',
      isPrimary: true,
      order: 1
    },
    // Safari images
    {
      vehicleId: vehicles.find(v => v.model === 'Safari')?.id || '',
      imageUrl: '/uploads/vehicles/tata-safari-1.jpg',
      altText: 'تاتا سفاري - أمامي',
      isPrimary: true,
      order: 1
    },
    // Harrier images
    {
      vehicleId: vehicles.find(v => v.model === 'Harrier')?.id || '',
      imageUrl: '/uploads/vehicles/tata-harrier-1.jpg',
      altText: 'تاتا هارير - أمامي',
      isPrimary: true,
      order: 1
    }
  ]

  for (const image of vehicleImages) {
    if (image.vehicleId) {
      await prisma.vehicleImage.create({ data: image })
    }
  }
}

async function seedVehicleSpecifications() {
  console.log('⚙️ Seeding vehicle specifications...')

  const vehicles = await prisma.vehicle.findMany()

  const specifications = [
    // Nexon specifications
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      key: 'engine',
      label: 'المحرك',
      value: '1.2L Turbocharged Petrol',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      key: 'power',
      label: 'القدرة الحصانية',
      value: '110 HP',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      key: 'seating',
      label: 'عدد المقاعد',
      value: '5',
      category: 'INTERIOR'
    },
    // Punch specifications
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      key: 'engine',
      label: 'المحرك',
      value: '1.2L Naturally Aspirated Petrol',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      key: 'power',
      label: 'القدرة الحصانية',
      value: '85 HP',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      key: 'seating',
      label: 'عدد المقاعد',
      value: '5',
      category: 'INTERIOR'
    },
    // Tiago specifications
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      key: 'engine',
      label: 'المحرك',
      value: '1.2L Revotron Petrol',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      key: 'power',
      label: 'القدرة الحصانية',
      value: '85 HP',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      key: 'seating',
      label: 'عدد المقاعد',
      value: '5',
      category: 'INTERIOR'
    }
  ]

  for (const spec of specifications) {
    if (spec.vehicleId) {
      await prisma.vehicleSpecification.create({ data: spec })
    }
  }
}

async function seedVehiclePricing() {
  console.log('💰 Seeding vehicle pricing...')

  const vehicles = await prisma.vehicle.findMany()

  for (const vehicle of vehicles) {
    const pricing = {
      vehicleId: vehicle.id,
      basePrice: vehicle.price,
      totalPrice: vehicle.price * 1.14, // Including 14% tax
      currency: 'EGP',
      hasDiscount: vehicle.featured,
      discountPercentage: vehicle.featured ? 5 : 0,
      taxes: vehicle.price * 0.14,
      fees: 5000
    }

    if (pricing.hasDiscount) {
      pricing.discountPrice = pricing.basePrice * 0.95
      pricing.discountExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }

    await prisma.vehiclePricing.create({ data: pricing })
  }
}

async function seedServiceTypes() {
  console.log('🔧 Seeding service types...')

  const serviceTypes = [
    {
      name: 'صيانة دورية',
      description: 'صيانة دورية شاملة لجميع سيارات تاتا',
      duration: 120,
      price: 500,
      category: 'MAINTENANCE',
      isActive: true
    },
    {
      name: 'تغيير الزيت',
      description: 'تغيير زيت المحرك والفلتر',
      duration: 30,
      price: 150,
      category: 'MAINTENANCE',
      isActive: true
    },
    {
      name: 'فحص الفرامل',
      description: 'فحص وصيانة نظام الفرامل',
      duration: 60,
      price: 300,
      category: 'REPAIR',
      isActive: true
    },
    {
      name: 'تكييف الهواء',
      description: 'صيانة نظام التكييف',
      duration: 90,
      price: 250,
      category: 'REPAIR',
      isActive: true
    },
    {
      name: 'فحص عام',
      description: 'فحص شامل قبل السفر',
      duration: 45,
      price: 100,
      category: 'INSPECTION',
      isActive: true
    }
  ]

  for (const serviceType of serviceTypes) {
    await prisma.serviceType.create({ data: serviceType })
  }
}

async function seedTestDriveBookings() {
  console.log('🚗 Seeding test drive bookings...')

  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany({ where: { featured: true } })

  if (users.length > 0 && vehicles.length > 0) {
    const bookings = [
      {
        customerId: users[0].id,
        vehicleId: vehicles[0].id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timeSlot: '10:00-11:00',
        status: 'CONFIRMED',
        notes: 'العميل مهتم جداً بالسيارة'
      },
      {
        customerId: users[1].id,
        vehicleId: vehicles[1].id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        timeSlot: '11:00-12:00',
        status: 'PENDING',
        notes: 'ينتظر تأكيد من الإدارة'
      }
    ]

    for (const booking of bookings) {
      await prisma.testDriveBooking.create({ data: booking })
    }
  }
}

async function seedServiceBookings() {
  console.log('🔧 Seeding service bookings...')

  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany()
  const serviceTypes = await prisma.serviceType.findMany()

  if (users.length > 0 && vehicles.length > 0 && serviceTypes.length > 0) {
    const bookings = [
      {
        customerId: users[0].id,
        vehicleId: vehicles[0].id,
        serviceTypeId: serviceTypes[0].id,
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        timeSlot: '09:00-10:00',
        status: 'CONFIRMED',
        totalPrice: serviceTypes[0].price,
        paymentStatus: 'PENDING',
        notes: 'صيانة دورية للسيارة'
      },
      {
        customerId: users[1].id,
        vehicleId: vehicles[1].id,
        serviceTypeId: serviceTypes[1].id,
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        timeSlot: '14:00-15:00',
        status: 'PENDING',
        totalPrice: serviceTypes[1].price,
        paymentStatus: 'PENDING',
        notes: 'تغيير زيت وفحص عام'
      }
    ]

    for (const booking of bookings) {
      await prisma.serviceBooking.create({ data: booking })
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })