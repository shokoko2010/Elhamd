import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting production seed...')

  try {
    // 1. Create basic site settings
    const siteSettings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        siteTitle: 'شركة الحمد لاستيراد السيارات',
        siteDescription: 'الوكيل الحصري لشركة تاتا موتورز في مصر - السيارات التجارية والبيك أب والشاحنات',
        contactEmail: 'info@elhamdimport.online',
        contactPhone: '+20 2 12345678',
        contactAddress: 'القنطرة غرب، الإسماعيلية، مصر',
        socialLinks: {
          facebook: 'https://facebook.com/elhamdimport',
          twitter: 'https://twitter.com/elhamdimport',
          instagram: 'https://instagram.com/elhamdimport',
          linkedin: 'https://linkedin.com/company/elhamdimport'
        },
        workingHours: 'السبت - الخميس: 9:00 ص - 5:00 م، الجمعة: مغلق'
      }
    })
    console.log('✓ Site settings created')

    // 2. Create main branch
    const mainBranch = await prisma.branch.upsert({
      where: { code: 'MAIN' },
      update: {},
      create: {
        name: 'الفرع الرئيسي',
        code: 'MAIN',
        address: 'القنطرة غرب، الإسماعيلية، مصر',
        phone: '+20 2 12345678',
        email: 'info@elhamdimport.online',
        openingDate: new Date('2010-01-01'),
        currency: 'EGP',
        timezone: 'Africa/Cairo'
      }
    })
    console.log('✓ Main branch created')

    // 3. Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@elhamdimport.online' },
      update: {},
      create: {
        email: 'admin@elhamdimport.online',
        password: hashedPassword,
        name: 'مدير النظام',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
        branchId: mainBranch.id
      }
    })
    console.log('✓ Admin user created')

    // 4. Create basic permissions
    const permissions = [
      { name: 'view_dashboard', description: 'عرض لوحة التحكم', category: 'SYSTEM_SETTINGS' },
      { name: 'manage_users', description: 'إدارة المستخدمين', category: 'USER_MANAGEMENT' },
      { name: 'manage_vehicles', description: 'إدارة المركبات', category: 'VEHICLE_MANAGEMENT' },
      { name: 'manage_bookings', description: 'إدارة الحجوزات', category: 'BOOKING_MANAGEMENT' },
      { name: 'manage_finances', description: 'إدارة الشؤون المالية', category: 'FINANCIAL_MANAGEMENT' },
      { name: 'view_reports', description: 'عرض التقارير', category: 'SYSTEM_SETTINGS' }
    ]

    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission
      })
    }
    console.log('✓ Basic permissions created')

    // 5. Create admin role template
    const adminRole = await prisma.roleTemplate.upsert({
      where: { name: 'Administrator' },
      update: {},
      create: {
        name: 'Administrator',
        description: 'مدير النظام',
        role: 'ADMIN',
        permissions: permissions.map(p => p.name),
        isActive: true,
        isSystem: true
      }
    })
    console.log('✓ Admin role template created')

    // 6. Create basic service types
    const serviceTypes = [
      {
        name: 'صيانة دورية',
        description: 'صيانة دورية للمركبات',
        duration: 120,
        price: 500,
        category: 'MAINTENANCE'
      },
      {
        name: 'تغيير زيت',
        description: 'تغيير زيت المحرك والفلاتر',
        duration: 60,
        price: 200,
        category: 'MAINTENANCE'
      },
      {
        name: 'فحص شامل',
        description: 'فحص شامل للمركبة',
        duration: 90,
        price: 300,
        category: 'INSPECTION'
      }
    ]

    for (const serviceType of serviceTypes) {
      await prisma.serviceType.create({
        data: serviceType
      })
    }
    console.log('✓ Service types created')

    // 7. Create sample vehicles
    const vehicles = [
      {
        make: 'Tata',
        model: 'Yodha',
        year: 2024,
        price: 350000,
        stockNumber: 'TAT-YOD-001',
        vin: 'MAT62345678901234',
        description: 'شاحنة صغيرة متعددة الاستخدامات',
        category: 'TRUCK',
        fuelType: 'DIESEL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        branchId: mainBranch.id
      },
      {
        make: 'Tata',
        model: 'Intra V30',
        year: 2024,
        price: 280000,
        stockNumber: 'TAT-INT-001',
        vin: 'MAT62345678901235',
        description: 'ميني باص مريح وعصري',
        category: 'PICKUP',
        fuelType: 'DIESEL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'فضي',
        status: 'AVAILABLE',
        branchId: mainBranch.id
      }
    ]

    for (const vehicle of vehicles) {
      await prisma.vehicle.upsert({
        where: { stockNumber: vehicle.stockNumber },
        update: {},
        create: vehicle
      })
    }
    console.log('✓ Sample vehicles created')

    // 8. Create basic time slots
    const timeSlots = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', maxBookings: 2 },
      { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', maxBookings: 2 },
      { dayOfWeek: 1, startTime: '11:00', endTime: '12:00', maxBookings: 2 },
      { dayOfWeek: 1, startTime: '12:00', endTime: '13:00', maxBookings: 2 },
      { dayOfWeek: 1, startTime: '14:00', endTime: '15:00', maxBookings: 2 },
      { dayOfWeek: 1, startTime: '15:00', endTime: '16:00', maxBookings: 2 },
      { dayOfWeek: 1, startTime: '16:00', endTime: '17:00', maxBookings: 2 }
    ]

    for (const timeSlot of timeSlots) {
      await prisma.timeSlot.upsert({
        where: {
          dayOfWeek_startTime_endTime: {
            dayOfWeek: timeSlot.dayOfWeek,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime
          }
        },
        update: {},
        create: timeSlot
      })
    }
    console.log('✓ Time slots created')

    console.log('🎉 Production seed completed successfully!')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })