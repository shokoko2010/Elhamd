import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting PostgreSQL database seeding...')

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...')
    await prisma.vehicleImage.deleteMany()
    await prisma.vehicle.deleteMany()
    await prisma.slider.deleteMany()
    await prisma.siteSettings.deleteMany()
    await prisma.user.deleteMany()

    // 1. Create admin user
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@elhamd.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
      }
    })
    console.log(`✅ Admin user created: ${adminUser.email}`)

    // 2. Create site settings
    console.log('⚙️ Creating site settings...')
    const siteSettings = await prisma.siteSettings.create({
      data: {
        logoUrl: '/uploads/logo/alhamd-cars-logo.png',
        faviconUrl: '/favicon.ico',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        siteTitle: 'الحمد للسيارات',
        siteDescription: 'مركز سيارات الحمد - أفضل خدمة لسيارتك',
        contactEmail: 'info@elhamd-cars.com',
        contactPhone: '+20 2 1234 5678',
        contactAddress: 'شارع التحرير',
        workingHours: '9:00 ص - 8:00 م',
        socialLinks: {},
        seoSettings: {},
        performanceSettings: {
          cachingEnabled: true,
          debugMode: false,
          autoBackup: true,
          sessionTimeout: 30
        },
        headerSettings: {
          navigation: [
            { id: '1', label: 'Home', href: '/', order: 1, isVisible: true },
            { id: '2', label: 'Vehicles', href: '/vehicles', order: 2, isVisible: true },
            { id: '3', label: 'Services', href: '/service-booking', order: 3, isVisible: true },
            { id: '4', label: 'Test Drive', href: '/test-drive', order: 4, isVisible: true },
            { id: '5', label: 'About Us', href: '/about', order: 5, isVisible: true },
            { id: '6', label: 'Contact', href: '/contact', order: 6, isVisible: true }
          ]
        },
        footerSettings: {},
        isActive: true,
      }
    })
    console.log(`✅ Site settings created with logo: ${siteSettings.logoUrl}`)

    // 3. Create sliders
    console.log('🎠 Creating sliders...')
    const sliders = [
      {
        title: 'تاتا نيكسون 2024',
        subtitle: 'SUV عائلية متطورة',
        description: 'تجربة القيادة المثالية مع أحدث تقنيات السلامة والراحة. تمتع بأداء استثنائي وتصميم عصري يناسب جميع احتياجاتك.',
        imageUrl: '/uploads/banners/nexon-banner.jpg',
        ctaText: 'اكتشف المزيد',
        ctaLink: '/vehicles',
        badge: 'جديد',
        badgeColor: 'bg-green-500',
        order: 0,
        isActive: true,
      },
      {
        title: 'تاتا بانش',
        subtitle: 'SUV مدمجة للمدن',
        description: 'سيارة المدينة المثالية بتصميم عملي وأسعار تنافسية. قوة ومتانة في حجم صغير.',
        imageUrl: '/uploads/banners/punch-banner.jpg',
        ctaText: 'احجز الآن',
        ctaLink: '/test-drive',
        badge: 'الأكثر مبيعاً',
        badgeColor: 'bg-green-500',
        order: 1,
        isActive: true,
      },
      {
        title: 'تاتا تياجو إلكتريك',
        subtitle: 'مستقبل الكهرباء',
        description: 'انضم إلى ثورة السيارات الكهربائية مع تاتا تياجو إلكتريك. صديق للبيئة، اقتصادي في استهلاك الطاقة.',
        imageUrl: '/uploads/banners/tiago-electric-banner.jpg',
        ctaText: 'جرب القيادة',
        ctaLink: '/test-drive',
        badge: 'كهربائي',
        badgeColor: 'bg-blue-500',
        order: 2,
        isActive: true,
      }
    ]

    for (const sliderData of sliders) {
      const slider = await prisma.slider.create({ data: sliderData })
      console.log(`✅ Slider created: ${slider.title}`)
    }

    // 4. Create vehicles
    console.log('🚗 Creating vehicles...')
    const vehicles = [
      {
        make: 'Tata',
        model: 'Nexon',
        year: 2024,
        price: 450000,
        stockNumber: 'NEX-2024-001',
        vin: 'MAT62345678901234',
        description: 'تاتا نيكسون 2024 - سيارة SUV عائلية متطورة بمحرك قوي وتصميم عصري',
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        featured: true,
      },
      {
        make: 'Tata',
        model: 'Punch',
        year: 2024,
        price: 320000,
        stockNumber: 'PUN-2024-001',
        vin: 'MAT62345678901235',
        description: 'تاتا بانش 2024 - سيارة مدمجة للمدن بتصميم عملي وأسعار تنافسية',
        category: 'COMPACT',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'رمادي',
        status: 'AVAILABLE',
        featured: true,
      },
      {
        make: 'Tata',
        model: 'Tiago',
        year: 2024,
        price: 280000,
        stockNumber: 'TIA-2024-001',
        vin: 'MAT62345678901236',
        description: 'تاتا تياجو 2024 - سيارة هاتشباك عملية اقتصادية وموثوقة',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أحمر',
        status: 'AVAILABLE',
        featured: false,
      },
      {
        make: 'Tata',
        model: 'Altroz',
        year: 2024,
        price: 350000,
        stockNumber: 'ALT-2024-001',
        vin: 'MAT62345678901237',
        description: 'تاتا ألتروز 2024 - سيارة بريميوم هاتشباك بتصميم أوروبي',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أزرق',
        status: 'AVAILABLE',
        featured: false,
      },
      {
        make: 'Tata',
        model: 'Harrier',
        year: 2024,
        price: 550000,
        stockNumber: 'HAR-2024-001',
        vin: 'MAT62345678901238',
        description: 'تاتا هارير 2024 - سيارة SUV فاخرة بتصميم جريء ومحرك قوي',
        category: 'SUV',
        fuelType: 'DIESEL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أسود',
        status: 'AVAILABLE',
        featured: true,
      },
      {
        make: 'Tata',
        model: 'Safari',
        year: 2024,
        price: 650000,
        stockNumber: 'SAF-2024-001',
        vin: 'MAT62345678901239',
        description: 'تاتا سفاري 2024 - سيارة SUV عائلية كبيرة بمساحة واسعة وراحة فائقة',
        category: 'SUV',
        fuelType: 'DIESEL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'فضي',
        status: 'AVAILABLE',
        featured: true,
      }
    ]

    const createdVehicles = []
    for (const vehicleData of vehicles) {
      const vehicle = await prisma.vehicle.create({ data: vehicleData })
      createdVehicles.push(vehicle)
      console.log(`✅ Vehicle created: ${vehicle.make} ${vehicle.model}`)
    }

    // 5. Create vehicle images
    console.log('📸 Creating vehicle images...')
    const vehicleImages = [
      // Nexon images
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/1/nexon-front.jpg', altText: 'تاتا نيكسون - أمام', isPrimary: true, order: 0 },
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/1/nexon-side.jpg', altText: 'تاتا نيكسون - جانب', isPrimary: false, order: 1 },
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/1/nexon-front-new.jpg', altText: 'تاتا نيكسون - أمام جديد', isPrimary: false, order: 2 },
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/1/nexon-side-new.jpg', altText: 'تاتا نيكسون - جانب جديد', isPrimary: false, order: 3 },
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/tata-nexon-1.jpg', altText: 'تاتا نيكسون - صورة 1', isPrimary: false, order: 4 },
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/tata-nexon-2.jpg', altText: 'تاتا نيكسون - صورة 2', isPrimary: false, order: 5 },
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/tata-nexon-3.jpg', altText: 'تاتا نيكسون - صورة 3', isPrimary: false, order: 6 },

      // Punch images
      { vehicleId: createdVehicles[1].id, imageUrl: '/uploads/vehicles/2/punch-front.jpg', altText: 'تاتا بانش - أمام', isPrimary: true, order: 0 },
      { vehicleId: createdVehicles[1].id, imageUrl: '/uploads/vehicles/2/punch-front-new.jpg', altText: 'تاتا بانش - أمام جديد', isPrimary: false, order: 1 },
      { vehicleId: createdVehicles[1].id, imageUrl: '/uploads/vehicles/tata-punch-1.jpg', altText: 'تاتا بانش - صورة 1', isPrimary: false, order: 2 },
      { vehicleId: createdVehicles[1].id, imageUrl: '/uploads/vehicles/tata-punch-2.jpg', altText: 'تاتا بانش - صورة 2', isPrimary: false, order: 3 },

      // Tiago images
      { vehicleId: createdVehicles[2].id, imageUrl: '/uploads/vehicles/3/tiago-front.jpg', altText: 'تاتا تياجو - أمام', isPrimary: true, order: 0 },
      { vehicleId: createdVehicles[2].id, imageUrl: '/uploads/vehicles/3/tiago-front-new.jpg', altText: 'تاتا تياجو - أمام جديد', isPrimary: false, order: 1 },
      { vehicleId: createdVehicles[2].id, imageUrl: '/uploads/vehicles/tata-tiago-1.jpg', altText: 'تاتا تياجو - صورة 1', isPrimary: false, order: 2 },
      { vehicleId: createdVehicles[2].id, imageUrl: '/uploads/vehicles/tata-tiago-2.jpg', altText: 'تاتا تياجو - صورة 2', isPrimary: false, order: 3 },

      // Altroz images
      { vehicleId: createdVehicles[3].id, imageUrl: '/uploads/vehicles/6/altroz-front.jpg', altText: 'تاتا ألتروز - أمام', isPrimary: true, order: 0 },
      { vehicleId: createdVehicles[3].id, imageUrl: '/uploads/vehicles/tata-altroz-1.jpg', altText: 'تاتا ألتروز - صورة 1', isPrimary: false, order: 1 },
      { vehicleId: createdVehicles[3].id, imageUrl: '/uploads/vehicles/tata-altroz-2.jpg', altText: 'تاتا ألتروز - صورة 2', isPrimary: false, order: 2 },

      // Harrier images
      { vehicleId: createdVehicles[4].id, imageUrl: '/uploads/vehicles/5/harrier-front.jpg', altText: 'تاتا هارير - أمام', isPrimary: true, order: 0 },
      { vehicleId: createdVehicles[4].id, imageUrl: '/uploads/vehicles/tata-harrier-1.jpg', altText: 'تاتا هارير - صورة 1', isPrimary: false, order: 1 },
      { vehicleId: createdVehicles[4].id, imageUrl: '/uploads/vehicles/tata-harrier-2.jpg', altText: 'تاتا هارير - صورة 2', isPrimary: false, order: 2 },
      { vehicleId: createdVehicles[4].id, imageUrl: '/uploads/vehicles/tata-harrier-3.jpg', altText: 'تاتا هارير - صورة 3', isPrimary: false, order: 3 },

      // Safari images
      { vehicleId: createdVehicles[5].id, imageUrl: '/uploads/vehicles/tata-safari-1.jpg', altText: 'تاتا سفاري - صورة 1', isPrimary: true, order: 0 },
      { vehicleId: createdVehicles[5].id, imageUrl: '/uploads/vehicles/tata-safari-2.jpg', altText: 'تاتا سفاري - صورة 2', isPrimary: false, order: 1 },
      { vehicleId: createdVehicles[5].id, imageUrl: '/uploads/vehicles/tata-safari-3.jpg', altText: 'تاتا سفاري - صورة 3', isPrimary: false, order: 2 },

      // Additional EV and special variants
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/cmfu0hhzh0016q7lahk32bph7/nexon-ev-front.jpg', altText: 'تاتا نيكسون إلكتريك - أمام', isPrimary: false, order: 10 },
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/cmfu0hhzh0016q7lahk32bph7/nexon-ev-side.jpg', altText: 'تاتا نيكسون إلكتريك - جانب', isPrimary: false, order: 11 },
      { vehicleId: createdVehicles[0].id, imageUrl: '/uploads/vehicles/nxz2024001/nexon-ev-front.jpg', altText: 'تاتا نيكسون إلكتريك - أمام خاص', isPrimary: false, order: 12 },

      { vehicleId: createdVehicles[2].id, imageUrl: '/uploads/vehicles/cmfu0hhzg0012q7lat04ub896/tiago-ev-front.jpg', altText: 'تاتا تياجو إلكتريك - أمام', isPrimary: false, order: 10 },
      { vehicleId: createdVehicles[2].id, imageUrl: '/uploads/vehicles/cmfu0hhzg0012q7lat04ub896/tiago-ev-side.jpg', altText: 'تاتا تياجو إلكتريك - جانب', isPrimary: false, order: 11 },
      { vehicleId: createdVehicles[2].id, imageUrl: '/uploads/vehicles/tige2024001/tiago-ev-front.jpg', altText: 'تاتا تياجو إلكتريك - أمام خاص', isPrimary: false, order: 12 },

      // Tigor variant
      { vehicleId: createdVehicles[3].id, imageUrl: '/uploads/vehicles/4/tigor-front.jpg', altText: 'تاتا تيغور - أمام', isPrimary: false, order: 10 }
    ]

    for (const imageData of vehicleImages) {
      const image = await prisma.vehicleImage.create({ data: imageData })
      console.log(`✅ Vehicle image created: ${image.altText}`)
    }

    console.log('\n🎉 PostgreSQL database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   👤 Admin user: ${adminUser.email}`)
    console.log(`   ⚙️ Site settings: ${siteSettings.siteTitle}`)
    console.log(`   🎠 Sliders: ${sliders.length}`)
    console.log(`   🚗 Vehicles: ${vehicles.length}`)
    console.log(`   📸 Vehicle images: ${vehicleImages.length}`)
    console.log('\n🔑 Login credentials:')
    console.log('   Email: admin@elhamd.com')
    console.log('   Password: admin123')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
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