import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Administrator',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create Al-Hamd Cars admin user
  const alhamdAdminPassword = await bcrypt.hash('admin123', 12)
  const alhamdAdmin = await prisma.user.upsert({
    where: { email: 'admin@alhamdcars.com' },
    update: {},
    create: {
      email: 'admin@alhamdcars.com',
      name: 'Al-Hamd Cars Administrator',
      password: alhamdAdminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create a branch manager
  const managerPassword = await bcrypt.hash('manager123', 12)
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Branch Manager',
      password: managerPassword,
      role: 'BRANCH_MANAGER',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create a staff user
  const staffPassword = await bcrypt.hash('staff123', 12)
  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      name: 'Staff User',
      password: staffPassword,
      role: 'STAFF',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create a customer user
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Customer User',
      password: customerPassword,
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create additional customers
  const customer2 = await prisma.user.upsert({
    where: { email: 'ahmed@example.com' },
    update: {},
    create: {
      email: 'ahmed@example.com',
      name: 'أحمد محمد',
      password: customerPassword,
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: true,
    },
  })

  const customer3 = await prisma.user.upsert({
    where: { email: 'fatima@example.com' },
    update: {},
    create: {
      email: 'fatima@example.com',
      name: 'فاطمة علي',
      password: customerPassword,
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: true,
    },
  })

  // Clean up existing data to avoid duplicates
  await prisma.serviceItem.deleteMany()
  await prisma.companyFeature.deleteMany()

  // Create branches
  const mainBranch = await prisma.branch.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'الفرع الرئيسي',
      code: 'MAIN',
      address: 'القاهرة، مصر - شارع التحرير',
      phone: '+20 2 12345678',
      email: 'main@alhamdcars.com',
      isActive: true,
      openingDate: new Date('2020-01-01'),
      managerId: manager.id,
    },
  })

  const maadiBranch = await prisma.branch.upsert({
    where: { code: 'MAADI' },
    update: {},
    create: {
      name: 'فرع المعادي',
      code: 'MAADI',
      address: 'المعادي، القاهرة - شارع 9',
      phone: '+20 2 23456789',
      email: 'maadi@alhamdcars.com',
      isActive: true,
      openingDate: new Date('2021-06-01'),
    },
  })

  const nasrCityBranch = await prisma.branch.upsert({
    where: { code: 'NASR' },
    update: {},
    create: {
      name: 'فرع مدينة نصر',
      code: 'NASR',
      address: 'مدينة نصر، القاهرة',
      phone: '+20 2 34567890',
      email: 'nascity@alhamdcars.com',
      isActive: true,
      openingDate: new Date('2022-03-15'),
    },
  })

  // Update manager and staff with branch
  await prisma.user.update({
    where: { id: manager.id },
    data: { branchId: mainBranch.id },
  })

  await prisma.user.update({
    where: { id: staff.id },
    data: { branchId: mainBranch.id },
  })

  // Create Company Info
  const companyInfo = await prisma.companyInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      title: 'الحمد للسيارات - وكيل تاتا المعتمد',
      subtitle: 'الجودة والثقة في عالم السيارات',
      description: 'نحن وكيل تاتا المعتمد في مصر، نقدم أحدث موديلات تاتا مع ضمان المصنع الكامل وخدمة ما بعد البيع المتميزة. لدينا 25 عاماً من الخبرة في مجال بيع وخدمة السيارات.',
      imageUrl: '/uploads/showroom-luxury.jpg',
      features: [
        'وكيل معتمد لتاتا',
        'ضمان المصنع الكامل',
        'خدمة ما بعد البيع 24/7',
        'تمويل سهل ومريح',
        'قطع غيار أصلية',
        'فنيون معتمدون'
      ],
      ctaButtons: [
        { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
        { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
      ],
      isActive: true,
    },
  })

  // Create Sliders
  const sliders = await Promise.all([
    prisma.slider.upsert({
      where: { id: 'slider1' },
      update: {},
      create: {
        title: 'تاتا نيكسون 2024',
        subtitle: 'السيارة الأكثر مبيعاً في مصر',
        description: 'استمتع بأداء استثنائي وتصميم عصري مع أحدث موديل تاتا نيكسون',
        imageUrl: '/uploads/banners/nexon-banner.jpg',
        ctaText: 'اكتشف المزيد',
        ctaLink: '/vehicles',
        badge: 'جديد',
        badgeColor: 'bg-red-500',
        order: 1,
        isActive: true,
      },
    }),
    prisma.slider.upsert({
      where: { id: 'slider2' },
      update: {},
      create: {
        title: 'تاتا بانش',
        subtitle: 'قوة ومتانة في حجم صغير',
        description: 'سيارة المدينة المثالية بتصميم عملي وأسعار تنافسية',
        imageUrl: '/uploads/banners/punch-banner.jpg',
        ctaText: 'احجز الآن',
        ctaLink: '/test-drive',
        badge: 'الأكثر مبيعاً',
        badgeColor: 'bg-green-500',
        order: 2,
        isActive: true,
      },
    }),
    prisma.slider.upsert({
      where: { id: 'slider3' },
      update: {},
      create: {
        title: 'تاتا تياجو إلكتريك',
        subtitle: 'مستقبل السيارات الكهربائية',
        description: 'انضم إلى ثورة السيارات الكهربائية مع تاتا تياجو إلكتريك',
        imageUrl: '/uploads/banners/electric-banner.jpg',
        ctaText: 'تعرف على المزيد',
        ctaLink: '/vehicles',
        badge: 'كهربائي',
        badgeColor: 'bg-blue-500',
        order: 3,
        isActive: true,
      },
    }),
  ])

  // Create Service Items
  const serviceItems = await Promise.all([
    prisma.serviceItem.upsert({
      where: { id: 'service1' },
      update: {},
      create: {
        title: 'بيع السيارات الجديدة',
        description: 'أحدث موديلات تاتا 2024 مع ضمان المصنع الكامل',
        icon: 'Car',
        link: '/vehicles',
        order: 1,
        isActive: true,
      },
    }),
    prisma.serviceItem.upsert({
      where: { id: 'service2' },
      update: {},
      create: {
        title: 'القيادة التجريبية',
        description: 'جرب السيارة قبل الشراء واختبر أدائها',
        icon: 'Calendar',
        link: '/test-drive',
        order: 2,
        isActive: true,
      },
    }),
    prisma.serviceItem.upsert({
      where: { id: 'service3' },
      update: {},
      create: {
        title: 'الصيانة والخدمة',
        description: 'خدمة صيانة معتمدة مع فنيين متخصصين',
        icon: 'Wrench',
        link: '/maintenance',
        order: 3,
        isActive: true,
      },
    }),
    prisma.serviceItem.upsert({
      where: { id: 'service4' },
      update: {},
      create: {
        title: 'التمويل',
        description: 'خيارات تمويل مرنة وبنود سداد مريحة',
        icon: 'CreditCard',
        link: '/financing',
        order: 4,
        isActive: true,
      },
    }),
    prisma.serviceItem.upsert({
      where: { id: 'service5' },
      update: {},
      create: {
        title: 'تأمين السيارات',
        description: 'تأمين شامل للسيارات من أفضل شركات التأمين',
        icon: 'Shield',
        link: '/insurance',
        order: 5,
        isActive: true,
      },
    }),
  ])

  // Create Company Stats
  const companyStats = await Promise.all([
    prisma.companyStat.upsert({
      where: { id: 'stat1' },
      update: {},
      create: {
        number: '25+',
        label: 'سنة خبرة',
        icon: 'Award',
        order: 1,
        isActive: true,
      },
    }),
    prisma.companyStat.upsert({
      where: { id: 'stat2' },
      update: {},
      create: {
        number: '50,000+',
        label: 'سيارة مباعة',
        icon: 'Car',
        order: 2,
        isActive: true,
      },
    }),
    prisma.companyStat.upsert({
      where: { id: 'stat3' },
      update: {},
      create: {
        number: '15',
        label: 'فرع',
        icon: 'MapPin',
        order: 3,
        isActive: true,
      },
    }),
    prisma.companyStat.upsert({
      where: { id: 'stat4' },
      update: {},
      create: {
        number: '100,000+',
        label: 'عميل راضٍ',
        icon: 'Users',
        order: 4,
        isActive: true,
      },
    }),
  ])

  // Create Company Values
  const companyValues = await Promise.all([
    prisma.companyValue.upsert({
      where: { id: 'value1' },
      update: {},
      create: {
        title: 'الجودة',
        description: 'نلتزم بأعلى معايير الجودة في كل ما نقدمه',
        icon: 'Star',
        order: 1,
        isActive: true,
      },
    }),
    prisma.companyValue.upsert({
      where: { id: 'value2' },
      update: {},
      create: {
        title: 'الثقة',
        description: 'نبني علاقات طويلة الأمد مبنية على الثقة والشفافية',
        icon: 'Shield',
        order: 2,
        isActive: true,
      },
    }),
    prisma.companyValue.upsert({
      where: { id: 'value3' },
      update: {},
      create: {
        title: 'الابتكار',
        description: 'نسعى دائماً لتقديم أحدث التقنيات والحلول',
        icon: 'Zap',
        order: 3,
        isActive: true,
      },
    }),
    prisma.companyValue.upsert({
      where: { id: 'value4' },
      update: {},
      create: {
        title: 'الخدمة',
        description: 'نضع العميل في مركز كل ما نقوم به',
        icon: 'Heart',
        order: 4,
        isActive: true,
      },
    }),
  ])

  // Create Company Features
  const companyFeatures = await Promise.all([
    prisma.companyFeature.upsert({
      where: { id: 'feature1' },
      update: {},
      create: {
        title: 'تشكيلة واسعة',
        description: 'أحدث موديلات تاتا 2024 بمواصفات عالمية وأسعار تنافسية',
        icon: 'Car',
        color: 'blue',
        features: ['نيكسون • بانش • تياجو', 'تيغور • ألتروز • هارير'],
        order: 1,
        isActive: true,
      },
    }),
    prisma.companyFeature.upsert({
      where: { id: 'feature2' },
      update: {},
      create: {
        title: 'خدمة مميزة',
        description: 'فريق محترف من الفنيين المعتمدين وخدمة عملاء على مدار الساعة',
        icon: 'Wrench',
        color: 'orange',
        features: ['صيانة معتمدة', 'قطع غيار أصلية'],
        order: 2,
        isActive: true,
      },
    }),
    prisma.companyFeature.upsert({
      where: { id: 'feature3' },
      update: {},
      create: {
        title: 'تمويل سهل',
        description: 'خيارات تمويل مرنة وبنود سداد مريحة تناسب جميع الميزانيات',
        icon: 'CreditCard',
        color: 'green',
        features: ['فوائد تنافسية', 'موافقات سريعة'],
        order: 3,
        isActive: true,
      },
    }),
  ])

  // Create Vehicles (8+ vehicles)
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { stockNumber: 'TNX2024001' },
      update: {},
      create: {
        make: 'Tata',
        model: 'Nexon',
        year: 2024,
        price: 650000,
        stockNumber: 'TNX2024001',
        vin: 'MAT625456K1M12345',
        description: 'تاتا نيكسون 2024 - سيارة SUV عائلية بمحرك قوي وتصميم عصري',
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        featured: true,
        branchId: mainBranch.id,
      },
    }),
    prisma.vehicle.upsert({
      where: { stockNumber: 'PNC2024001' },
      update: {},
      create: {
        make: 'Tata',
        model: 'Punch',
        year: 2024,
        price: 420000,
        stockNumber: 'PNC2024001',
        vin: 'MAT625456K1M12346',
        description: 'تاتا بانش 2024 - سيارة مدينة صغيرة عملية ومناسبة للعائلات',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أحمر',
        status: 'AVAILABLE',
        featured: true,
        branchId: mainBranch.id,
      },
    }),
    prisma.vehicle.upsert({
      where: { stockNumber: 'TIG2024001' },
      update: {},
      create: {
        make: 'Tata',
        model: 'Tiago',
        year: 2024,
        price: 380000,
        stockNumber: 'TIG2024001',
        vin: 'MAT625456K1M12347',
        description: 'تاتا تياجو 2024 - سيارة هايتشباك اقتصادية ومريحة',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'رمادي',
        status: 'AVAILABLE',
        featured: true,
        branchId: maadiBranch.id,
      },
    }),
    prisma.vehicle.upsert({
      where: { stockNumber: 'TGR2024001' },
      update: {},
      create: {
        make: 'Tata',
        model: 'Tigor',
        year: 2024,
        price: 450000,
        stockNumber: 'TGR2024001',
        vin: 'MAT625456K1M12348',
        description: 'تاتا تيغور 2024 - سيارة سيدان أنيقة ومتطورة',
        category: 'SEDAN',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أسود',
        status: 'AVAILABLE',
        featured: false,
        branchId: nasrCityBranch.id,
      },
    }),
    prisma.vehicle.upsert({
      where: { stockNumber: 'ATR2024001' },
      update: {},
      create: {
        make: 'Tata',
        model: 'Altroz',
        year: 2024,
        price: 480000,
        stockNumber: 'ATR2024001',
        vin: 'MAT625456K1M12349',
        description: 'تاتا ألتروز 2024 - سيارة هايتشباك عائلية بتصميم رياضي',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أزرق',
        status: 'AVAILABLE',
        featured: false,
        branchId: mainBranch.id,
      },
    }),
    prisma.vehicle.upsert({
      where: { stockNumber: 'HRR2024001' },
      update: {},
      create: {
        make: 'Tata',
        model: 'Harrier',
        year: 2024,
        price: 850000,
        stockNumber: 'HRR2024001',
        vin: 'MAT625456K1M12350',
        description: 'تاتا هارير 2024 - سيارة SUV فاخرة بمحرك قوي وتقنيات متقدمة',
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'برتقالي',
        status: 'AVAILABLE',
        featured: true,
        branchId: maadiBranch.id,
      },
    }),
    prisma.vehicle.upsert({
      where: { stockNumber: 'TIGE2024001' },
      update: {},
      create: {
        make: 'Tata',
        model: 'Tiago EV',
        year: 2024,
        price: 550000,
        stockNumber: 'TIGE2024001',
        vin: 'MAT625456K1M12351',
        description: 'تاتا تياجو إلكتريك 2024 - سيارة كهربائية صديقة للبيئة',
        category: 'HATCHBACK',
        fuelType: 'ELECTRIC',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أخضر',
        status: 'AVAILABLE',
        featured: true,
        branchId: nasrCityBranch.id,
      },
    }),
    prisma.vehicle.upsert({
      where: { stockNumber: 'NXZ2024001' },
      update: {},
      create: {
        make: 'Tata',
        model: 'Nexon EV',
        year: 2024,
        price: 750000,
        stockNumber: 'NXZ2024001',
        vin: 'MAT625456K1M12352',
        description: 'تاتا نيكسون إلكتريك 2024 - سيارة SUV كهربائية بمدى طويل',
        category: 'SUV',
        fuelType: 'ELECTRIC',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'فضي',
        status: 'AVAILABLE',
        featured: true,
        branchId: mainBranch.id,
      },
    }),
  ])

  // Create Vehicle Images
  const vehicleImages = await Promise.all([
    // Nexon images
    prisma.vehicleImage.upsert({
      where: { id: 'nexon1' },
      update: {},
      create: {
        vehicleId: vehicles[0].id,
        imageUrl: '/uploads/vehicles/1/nexon-front.jpg',
        altText: 'تاتا نيكسون - أمام',
        isPrimary: true,
        order: 1,
      },
    }),
    prisma.vehicleImage.upsert({
      where: { id: 'nexon2' },
      update: {},
      create: {
        vehicleId: vehicles[0].id,
        imageUrl: '/uploads/vehicles/1/nexon-side.jpg',
        altText: 'تاتا نيكسون - جانب',
        isPrimary: false,
        order: 2,
      },
    }),
    // Punch images
    prisma.vehicleImage.upsert({
      where: { id: 'punch1' },
      update: {},
      create: {
        vehicleId: vehicles[1].id,
        imageUrl: '/uploads/vehicles/2/punch-front.jpg',
        altText: 'تاتا بانش - أمام',
        isPrimary: true,
        order: 1,
      },
    }),
    // Tiago images
    prisma.vehicleImage.upsert({
      where: { id: 'tiago1' },
      update: {},
      create: {
        vehicleId: vehicles[2].id,
        imageUrl: '/uploads/vehicles/3/tiago-front.jpg',
        altText: 'تاتا تياجو - أمام',
        isPrimary: true,
        order: 1,
      },
    }),
    // Tigor images
    prisma.vehicleImage.upsert({
      where: { id: 'tigor1' },
      update: {},
      create: {
        vehicleId: vehicles[3].id,
        imageUrl: '/uploads/vehicles/4/tigor-front.jpg',
        altText: 'تاتا تيغور - أمام',
        isPrimary: true,
        order: 1,
      },
    }),
    // Harrier images
    prisma.vehicleImage.upsert({
      where: { id: 'harrier1' },
      update: {},
      create: {
        vehicleId: vehicles[5].id,
        imageUrl: '/uploads/vehicles/5/harrier-front.jpg',
        altText: 'تاتا هارير - أمام',
        isPrimary: true,
        order: 1,
      },
    }),
    // Altroz images
    prisma.vehicleImage.upsert({
      where: { id: 'altroz1' },
      update: {},
      create: {
        vehicleId: vehicles[4].id,
        imageUrl: '/uploads/vehicles/6/altroz-front.jpg',
        altText: 'تاتا ألتروز - أمام',
        isPrimary: true,
        order: 1,
      },
    }),
  ])

  // Create Service Types
  const serviceTypes = await Promise.all([
    prisma.serviceType.upsert({
      where: { id: 'service_type1' },
      update: {},
      create: {
        name: 'صيانة دورية',
        description: 'صيانة دورية شاملة للسيارة',
        duration: 120,
        price: 500,
        category: 'MAINTENANCE',
        isActive: true,
      },
    }),
    prisma.serviceType.upsert({
      where: { id: 'service_type2' },
      update: {},
      create: {
        name: 'تغيير زيت',
        description: 'تغيير زيت المحرك والفلتر',
        duration: 60,
        price: 200,
        category: 'MAINTENANCE',
        isActive: true,
      },
    }),
    prisma.serviceType.upsert({
      where: { id: 'service_type3' },
      update: {},
      create: {
        name: 'فحص شامل',
        description: 'فحص شامل للسيارة قبل الشراء',
        duration: 180,
        price: 300,
        category: 'INSPECTION',
        isActive: true,
      },
    }),
    prisma.serviceType.upsert({
      where: { id: 'service_type4' },
      update: {},
      create: {
        name: 'تكييف هواء',
        description: 'صيانة نظام التكييف',
        duration: 90,
        price: 400,
        category: 'REPAIR',
        isActive: true,
      },
    }),
  ])

  // Create Time Slots
  const timeSlots = await Promise.all([
    prisma.timeSlot.upsert({
      where: { id: 'slot1' },
      update: {},
      create: {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '10:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot2' },
      update: {},
      create: {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '11:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot3' },
      update: {},
      create: {
        dayOfWeek: 1,
        startTime: '11:00',
        endTime: '12:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
  ])

  // Create Test Drive Bookings
  const testDriveBookings = await Promise.all([
    prisma.testDriveBooking.upsert({
      where: { id: 'testdrive1' },
      update: {},
      create: {
        customerId: customer.id,
        vehicleId: vehicles[0].id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timeSlot: '10:00',
        status: 'PENDING',
        notes: 'يرغب في تجربة السيارة في المدينة',
      },
    }),
    prisma.testDriveBooking.upsert({
      where: { id: 'testdrive2' },
      update: {},
      create: {
        customerId: customer2.id,
        vehicleId: vehicles[1].id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        timeSlot: '11:00',
        status: 'CONFIRMED',
        notes: 'مهتم بالسيارة للاستخدام العائلي',
      },
    }),
  ])

  // Create Service Bookings
  const serviceBookings = await Promise.all([
    prisma.serviceBooking.upsert({
      where: { id: 'service1' },
      update: {},
      create: {
        customerId: customer.id,
        vehicleId: vehicles[0].id,
        serviceTypeId: serviceTypes[0].id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        timeSlot: '09:00',
        status: 'CONFIRMED',
        totalPrice: 500,
        paymentStatus: 'COMPLETED',
        notes: 'صيانة دورية للسيارة',
      },
    }),
    prisma.serviceBooking.upsert({
      where: { id: 'service2' },
      update: {},
      create: {
        customerId: customer2.id,
        vehicleId: vehicles[1].id,
        serviceTypeId: serviceTypes[1].id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        timeSlot: '10:00',
        status: 'PENDING',
        totalPrice: 200,
        paymentStatus: 'PENDING',
        notes: 'تغيير زيت المحرك',
      },
    }),
  ])

  // Create Permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'view_dashboard' },
      update: {},
      create: {
        name: 'view_dashboard',
        description: 'View dashboard',
        category: 'SYSTEM_SETTINGS',
        isActive: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'manage_users' },
      update: {},
      create: {
        name: 'manage_users',
        description: 'Manage users',
        category: 'USER_MANAGEMENT',
        isActive: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'manage_vehicles' },
      update: {},
      create: {
        name: 'manage_vehicles',
        description: 'Manage vehicles',
        category: 'VEHICLE_MANAGEMENT',
        isActive: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'manage_bookings' },
      update: {},
      create: {
        name: 'manage_bookings',
        description: 'Manage bookings',
        category: 'BOOKING_MANAGEMENT',
        isActive: true,
      },
    }),
  ])

  // Create Media Files
  const mediaFiles = await Promise.all([
    prisma.media.upsert({
      where: { id: 'media1' },
      update: {},
      create: {
        filename: 'nexon-hero.webp',
        originalName: 'nexon-hero.jpg',
        path: '/uploads/vehicles/nexon-hero.webp',
        url: '/uploads/vehicles/nexon-hero.webp',
        thumbnailUrl: '/uploads/thumbnails/nexon-hero-thumb.webp',
        mimeType: 'image/webp',
        size: 1024000,
        width: 1920,
        height: 1080,
        altText: 'تاتا نيكسون - صورة رئيسية',
        title: 'تاتا نيكسون',
        description: 'صورة رئيسية لتاتا نيكسون',
        tags: JSON.stringify(['تاتا', 'نيكسون', 'SUV', 'سيارة']),
        category: 'vehicle',
        isPublic: true,
        isFeatured: true,
        order: 1,
        metadata: JSON.stringify({
          originalSize: 2048000,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#ff0000'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: admin.id,
      },
    }),
    prisma.media.upsert({
      where: { id: 'media2' },
      update: {},
      create: {
        filename: 'showroom-luxury.webp',
        originalName: 'showroom-luxury.jpg',
        path: '/uploads/company/showroom-luxury.webp',
        url: '/uploads/company/showroom-luxury.webp',
        thumbnailUrl: '/uploads/thumbnails/showroom-luxury-thumb.webp',
        mimeType: 'image/webp',
        size: 2048000,
        width: 1920,
        height: 1080,
        altText: 'معرض الحمد للسيارات',
        title: 'المعرض الرئيسي',
        description: 'صورة خارجية للمعرض الرئيسي',
        tags: JSON.stringify(['معرض', 'الحمد', 'تاتا', 'سيارات']),
        category: 'company',
        isPublic: true,
        isFeatured: true,
        order: 2,
        metadata: JSON.stringify({
          originalSize: 4096000,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#cccccc'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: admin.id,
      },
    }),
    prisma.media.upsert({
      where: { id: 'media3' },
      update: {},
      create: {
        filename: 'service-center.webp',
        originalName: 'service-center.jpg',
        path: '/uploads/services/service-center.webp',
        url: '/uploads/services/service-center.webp',
        thumbnailUrl: '/uploads/thumbnails/service-center-thumb.webp',
        mimeType: 'image/webp',
        size: 1536000,
        width: 1920,
        height: 1080,
        altText: 'مركز صيانة الحمد للسيارات',
        title: 'مركز الصيانة',
        description: 'صورة لمركز الصيانة المتطور',
        tags: JSON.stringify(['صيانة', 'خدمة', 'تاتا', 'مركز']),
        category: 'services',
        isPublic: true,
        isFeatured: false,
        order: 3,
        metadata: JSON.stringify({
          originalSize: 3072000,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#ff9900'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: admin.id,
      },
    }),
    prisma.media.upsert({
      where: { id: 'media4' },
      update: {},
      create: {
        filename: 'punch-city.webp',
        originalName: 'punch-city.jpg',
        path: '/uploads/vehicles/punch-city.webp',
        url: '/uploads/vehicles/punch-city.webp',
        thumbnailUrl: '/uploads/thumbnails/punch-city-thumb.webp',
        mimeType: 'image/webp',
        size: 819200,
        width: 1920,
        height: 1080,
        altText: 'تاتا بانش في المدينة',
        title: 'تاتا بانش',
        description: 'صورة لتاتا بانش في بيئة حضرية',
        tags: JSON.stringify(['تاتا', 'بانش', 'مدينة', 'سيارة']),
        category: 'vehicle',
        isPublic: true,
        isFeatured: true,
        order: 4,
        metadata: JSON.stringify({
          originalSize: 1638400,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#ff0000'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: staff.id,
      },
    }),
    prisma.media.upsert({
      where: { id: 'media5' },
      update: {},
      create: {
        filename: 'tiago-electric.webp',
        originalName: 'tiago-electric.jpg',
        path: '/uploads/vehicles/tiago-electric.webp',
        url: '/uploads/vehicles/tiago-electric.webp',
        thumbnailUrl: '/uploads/thumbnails/tiago-electric-thumb.webp',
        mimeType: 'image/webp',
        size: 1228800,
        width: 1920,
        height: 1080,
        altText: 'تاتا تياجو إلكتريك',
        title: 'تاتا تياجو إلكتريك',
        description: 'صورة لتاتا تياجو الكهربائية',
        tags: JSON.stringify(['تاتا', 'تياجو', 'إلكتريك', 'سيارة']),
        category: 'vehicle',
        isPublic: true,
        isFeatured: true,
        order: 5,
        metadata: JSON.stringify({
          originalSize: 2457600,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#00ff00'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: staff.id,
      },
    }),
    prisma.media.upsert({
      where: { id: 'media6' },
      update: {},
      create: {
        filename: 'banner-nexon.webp',
        originalName: 'banner-nexon.jpg',
        path: '/uploads/banners/banner-nexon.webp',
        url: '/uploads/banners/banner-nexon.webp',
        thumbnailUrl: '/uploads/thumbnails/banner-nexon-thumb.webp',
        mimeType: 'image/webp',
        size: 1843200,
        width: 1920,
        height: 600,
        altText: 'بانر تاتا نيكسون',
        title: 'بانر تاتا نيكسون',
        description: 'بانر دعائي لتاتا نيكسون',
        tags: JSON.stringify(['تاتا', 'نيكسون', 'بانر', 'إعلان']),
        category: 'banner',
        isPublic: true,
        isFeatured: true,
        order: 6,
        metadata: JSON.stringify({
          originalSize: 3686400,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#ff0000'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: admin.id,
      },
    }),
  ])

  // Create Contact Info
  const contactInfo = await prisma.contactInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      primaryPhone: '+20 2 1234 5678',
      primaryEmail: 'info@alhamdcars.com',
      address: 'القاهرة، مصر - شارع التحرير',
      workingHours: JSON.stringify({
        saturday: '9 صباحاً - 10 مساءً',
        sunday: '9 صباحاً - 10 مساءً',
        monday: '9 صباحاً - 10 مساءً',
        tuesday: '9 صباحاً - 10 مساءً',
        wednesday: '9 صباحاً - 10 مساءً',
        thursday: '9 صباحاً - 10 مساءً',
        friday: '2 مساءً - 10 مساءً'
      }),
      departments: JSON.stringify({
        sales: {
          phone: '+20 2 1234 5678',
          email: 'sales@alhamdcars.com'
        },
        service: {
          phone: '+20 2 1234 5679',
          email: 'service@alhamdcars.com'
        }
      }),
      isActive: true,
    },
  })

  // Create Holidays for calendar
  const holidays = await Promise.all([
    prisma.holiday.upsert({
      where: { id: 'holiday1' },
      update: {},
      create: {
        date: new Date(new Date().getFullYear(), 11, 25), // Christmas Day
        name: 'عيد الميلاد',
        description: 'عطلة عيد الميلاد',
        isRecurring: true,
      },
    }),
    prisma.holiday.upsert({
      where: { id: 'holiday2' },
      update: {},
      create: {
        date: new Date(new Date().getFullYear(), 0, 1), // New Year's Day
        name: 'رأس السنة الميلادية',
        description: 'عطلة رأس السنة الميلادية',
        isRecurring: true,
      },
    }),
    prisma.holiday.upsert({
      where: { id: 'holiday3' },
      update: {},
      create: {
        date: new Date(new Date().getFullYear(), 5, 10), // Example holiday
        name: 'عيد الفطر',
        description: 'عطلة عيد الفطر',
        isRecurring: true,
      },
    }),
  ])

  // Create additional TimeSlots for all days of the week
  const additionalTimeSlots = await Promise.all([
    // Tuesday
    prisma.timeSlot.upsert({
      where: { id: 'slot4' },
      update: {},
      create: {
        dayOfWeek: 2, // Tuesday
        startTime: '09:00',
        endTime: '10:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot5' },
      update: {},
      create: {
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '11:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot6' },
      update: {},
      create: {
        dayOfWeek: 2,
        startTime: '11:00',
        endTime: '12:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    // Wednesday
    prisma.timeSlot.upsert({
      where: { id: 'slot7' },
      update: {},
      create: {
        dayOfWeek: 3, // Wednesday
        startTime: '09:00',
        endTime: '10:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot8' },
      update: {},
      create: {
        dayOfWeek: 3,
        startTime: '10:00',
        endTime: '11:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot9' },
      update: {},
      create: {
        dayOfWeek: 3,
        startTime: '11:00',
        endTime: '12:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    // Thursday
    prisma.timeSlot.upsert({
      where: { id: 'slot10' },
      update: {},
      create: {
        dayOfWeek: 4, // Thursday
        startTime: '09:00',
        endTime: '10:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot11' },
      update: {},
      create: {
        dayOfWeek: 4,
        startTime: '10:00',
        endTime: '11:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot12' },
      update: {},
      create: {
        dayOfWeek: 4,
        startTime: '11:00',
        endTime: '12:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    // Saturday
    prisma.timeSlot.upsert({
      where: { id: 'slot13' },
      update: {},
      create: {
        dayOfWeek: 6, // Saturday
        startTime: '09:00',
        endTime: '10:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot14' },
      update: {},
      create: {
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '11:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
    prisma.timeSlot.upsert({
      where: { id: 'slot15' },
      update: {},
      create: {
        dayOfWeek: 6,
        startTime: '11:00',
        endTime: '12:00',
        maxBookings: 2,
        isActive: true,
      },
    }),
  ])

  console.log('Database seeded successfully!')
  console.log('Admin user: admin@example.com / admin123')
  console.log('Manager user: manager@example.com / manager123')
  console.log('Staff user: staff@example.com / staff123')
  console.log('Customer user: customer@example.com / customer123')
  console.log('Created 3 branches, 3 sliders, 5 service items, 4 company stats, 4 company values, 3 company features, 8 vehicles, 4 service types, 6 media files, various bookings, 3 holidays, and 15 time slots')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })