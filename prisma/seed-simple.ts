import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple database seeding...')

  // Seed sliders first
  await seedSliders()
  console.log('🎠 Seeded sliders')

  // Seed media
  await seedMedia()
  console.log('📸 Seeded media')

  // Seed vehicles if they don't exist
  await seedVehicles()
  console.log('🚗 Seeded vehicles')

  console.log('✅ Simple database seeding completed successfully!')
}

async function seedSliders() {
  console.log('🎠 Seeding sliders...')

  // Check if sliders already exist
  const existingSliders = await prisma.slider.count()
  if (existingSliders > 0) {
    console.log('⏭️  Sliders already exist, skipping...')
    return
  }

  const sliders = [
    {
      title: 'Tata Nexon - SUV عائلية متطورة',
      subtitle: 'الأمان والقوة في تصميم عصري',
      description: 'اكتشف Tata Nexon، السيارة SUV التي تجمع بين التصميم الأنيق والأداء القوي والميزات الأمان المتقدمة. مثالية للعائلات المصرية.',
      imageUrl: '/uploads/banners/nexon-banner.jpg',
      ctaText: 'اطلب سيارتك الآن',
      ctaLink: '/vehicles?model=nexon',
      badge: 'الأكثر مبيعاً',
      badgeColor: 'bg-red-500',
      isActive: true,
      order: 1,
    },
    {
      title: 'Tata Punch - SUV مدمجة للمدن',
      subtitle: 'القوة والكفاءة في حجم مثالي',
      description: 'Tata Punch هي السيارة المثالية للقيادة في المدن المصرية. تصميم مدمج قوي مع استهلاك وقود ممتاز وميزات ذكية.',
      imageUrl: '/uploads/banners/punch-banner.jpg',
      ctaText: 'جرب قيادة تجريبية',
      ctaLink: '/test-drive',
      badge: 'جديد',
      badgeColor: 'bg-green-500',
      isActive: true,
      order: 2,
    },
    {
      title: 'Tata Tiago EV - مستقبل الكهرباء',
      subtitle: 'سيارة كهربائية اقتصادية وصديقة للبيئة',
      description: 'انضم إلى ثورة السيارات الكهربائية مع Tata Tiago EV. صفر انبعاثات، استهلاك طاقة منخفض، وتكاليف تشغيل اقتصادية.',
      imageUrl: '/uploads/banners/tiago-electric-banner.jpg',
      ctaText: 'اعرف المزيد',
      ctaLink: '/vehicles?fuel=ELECTRIC',
      badge: 'كهربائي',
      badgeColor: 'bg-blue-500',
      isActive: true,
      order: 3,
    }
  ]

  for (const slider of sliders) {
    await prisma.slider.create({
      data: slider
    })
  }
}

async function seedMedia() {
  console.log('📸 Seeding media...')

  // Check if media already exists
  const existingMedia = await prisma.media.count()
  if (existingMedia > 0) {
    console.log('⏭️  Media already exists, skipping...')
    return
  }

  const mediaItems = [
    // Vehicle images
    { url: '/uploads/vehicles/1/nexon-front-new.jpg', category: 'vehicles', title: 'Tata Nexon Front', altText: 'Tata Nexon - Front View' },
    { url: '/uploads/vehicles/1/nexon-side-new.jpg', category: 'vehicles', title: 'Tata Nexon Side', altText: 'Tata Nexon - Side View' },
    { url: '/uploads/vehicles/2/punch-front-new.jpg', category: 'vehicles', title: 'Tata Punch Front', altText: 'Tata Punch - Front View' },
    { url: '/uploads/vehicles/3/tiago-front-new.jpg', category: 'vehicles', title: 'Tata Tiago Front', altText: 'Tata Tiago - Front View' },
    { url: '/uploads/vehicles/4/tigor-front.jpg', category: 'vehicles', title: 'Tata Tigor Front', altText: 'Tata Tigor - Front View' },
    { url: '/uploads/vehicles/5/harrier-front.jpg', category: 'vehicles', title: 'Tata Harrier Front', altText: 'Tata Harrier - Front View' },
    { url: '/uploads/vehicles/6/altroz-front.jpg', category: 'vehicles', title: 'Tata Altroz Front', altText: 'Tata Altroz - Front View' },
    
    // Banner images for sliders
    { url: '/uploads/banners/nexon-banner.jpg', category: 'banner', title: 'Tata Nexon Banner', altText: 'Tata Nexon - Special Offer' },
    { url: '/uploads/banners/punch-banner.jpg', category: 'banner', title: 'Tata Punch Banner', altText: 'Tata Punch - Compact SUV' },
    { url: '/uploads/banners/tiago-electric-banner.jpg', category: 'banner', title: 'Tata Tiago EV Banner', altText: 'Tata Tiago EV - Electric Future' },
    { url: '/uploads/banners/service-banner.jpg', category: 'banner', title: 'Service Banner', altText: 'Professional Service Center' },
    { url: '/uploads/banners/showroom-banner.jpg', category: 'banner', title: 'Showroom Banner', altText: 'Modern Showroom' },
    { url: '/uploads/banners/electric-banner.jpg', category: 'banner', title: 'Electric Banner', altText: 'Electric Vehicles' },
    { url: '/uploads/banners/adventure-banner.jpg', category: 'banner', title: 'Adventure Banner', altText: 'Adventure Ready' },
    
    // Company images
    { url: '/uploads/showroom-luxury.jpg', category: 'company', title: 'Luxury Showroom', altText: 'Luxury Car Showroom' },
    { url: '/uploads/dealership-exterior.jpg', category: 'company', title: 'Dealership Exterior', altText: 'Dealership Building Exterior' },
    { url: '/uploads/logo/alhamd-cars-logo.png', category: 'company', title: 'Alhamd Cars Logo', altText: 'Alhamd Cars Company Logo' },
    
    // Gallery images
    { url: '/uploads/thumbnails/showroom-1_thumbnail.webp', category: 'gallery', title: 'Showroom Interior', altText: 'Showroom Interior View' },
    { url: '/uploads/thumbnails/luxury-sedan-1_thumbnail.webp', category: 'gallery', title: 'Luxury Sedan', altText: 'Luxury Sedan Car' },
    { url: '/uploads/thumbnails/sports-car-1_thumbnail.webp', category: 'gallery', title: 'Sports Car', altText: 'Sports Car View' },
    { url: '/uploads/thumbnails/service-1_thumbnail.webp', category: 'gallery', title: 'Service Center', altText: 'Car Service Center' },
    { url: '/uploads/thumbnails/banner-1_thumbnail.webp', category: 'gallery', title: 'Promotional Banner', altText: 'Promotional Car Banner' },
  ]

  for (const item of mediaItems) {
    await prisma.media.create({
      data: {
        filename: item.url.split('/').pop() || 'image.jpg',
        originalName: item.title,
        path: item.url,
        url: item.url,
        thumbnailUrl: item.url,
        mimeType: item.url.endsWith('.png') ? 'image/png' : 'image/jpeg',
        size: 500000, // Approximate size
        width: 800,
        height: 600,
        altText: item.altText,
        title: item.title,
        description: '',
        tags: JSON.stringify([item.category]),
        category: item.category,
        entityId: null,
        isPublic: true,
        isFeatured: item.category === 'banner',
        order: 0,
        metadata: JSON.stringify({
          source: 'uploads-folder',
          addedAt: new Date().toISOString()
        }),
        createdBy: 'system'
      }
    })
  }
}

async function seedVehicles() {
  console.log('🚗 Seeding vehicles...')

  // Check if vehicles already exist
  const existingVehicles = await prisma.vehicle.count()
  if (existingVehicles > 0) {
    console.log('⏭️  Vehicles already exist, skipping...')
    return
  }

  // Get first branch
  const branch = await prisma.branch.findFirst()
  if (!branch) {
    console.log('⚠️  No branch found, skipping vehicle seeding')
    return
  }

  const vehicles = [
    {
      make: 'TATA',
      model: 'Nexon',
      year: 2024,
      price: 450000,
      stockNumber: 'TNX-2024-001',
      vin: 'MAT62543798765432',
      description: 'سيارة SUV عائلية عصرية مع ميزات أمان متقدمة وتصميم أنيق',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أبيض',
      status: 'AVAILABLE',
      featured: true,
      branchId: branch.id,
    },
    {
      make: 'TATA',
      model: 'Punch',
      year: 2024,
      price: 320000,
      stockNumber: 'TPU-2024-002',
      vin: 'MAT62543798765433',
      description: 'سيارة SUV مدمجة مثالية للقيادة في المدينة',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'رمادي',
      status: 'AVAILABLE',
      featured: true,
      branchId: branch.id,
    },
    {
      make: 'TATA',
      model: 'Tiago',
      year: 2024,
      price: 280000,
      stockNumber: 'TTI-2024-003',
      vin: 'MAT62543798765434',
      description: 'سيارة هاتشباك اقتصادية مع استهلاك وقود ممتاز',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أحمر',
      status: 'AVAILABLE',
      featured: false,
      branchId: branch.id,
    },
    {
      make: 'TATA',
      model: 'Altroz',
      year: 2024,
      price: 350000,
      stockNumber: 'TAL-2024-004',
      vin: 'MAT62543798765435',
      description: 'سيارة هاتشباك Premium مع تصميم عصري',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أزرق',
      status: 'AVAILABLE',
      featured: false,
      branchId: branch.id,
    },
    {
      make: 'TATA',
      model: 'Harrier',
      year: 2024,
      price: 550000,
      stockNumber: 'THA-2024-005',
      vin: 'MAT62543798765436',
      description: 'سيارة SUV فاخرة بمحرك قوي وتصميم أنيق',
      category: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أسود',
      status: 'AVAILABLE',
      featured: true,
      branchId: branch.id,
    },
    {
      make: 'TATA',
      model: 'Safari',
      year: 2024,
      price: 650000,
      stockNumber: 'TSA-2024-006',
      vin: 'MAT62543798765437',
      description: 'سيارة SUV عائلية كبيرة بـ 7 مقاعد',
      category: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'فضي',
      status: 'SOLD',
      featured: false,
      branchId: branch.id,
    },
  ]

  for (const vehicle of vehicles) {
    const createdVehicle = await prisma.vehicle.create({
      data: vehicle,
    })

    // Add images for each vehicle
    await seedVehicleImages(createdVehicle.id, createdVehicle.model)
    
    // Add pricing
    await seedVehiclePricing(createdVehicle.id, createdVehicle.price)
  }
}

async function seedVehicleImages(vehicleId: string, model: string) {
  const vehicleImageMap = {
    'Nexon': [
      '/uploads/vehicles/1/nexon-front-new.jpg',
      '/uploads/vehicles/1/nexon-side-new.jpg',
      '/uploads/vehicles/tata-nexon-1.jpg',
      '/uploads/vehicles/tata-nexon-2.jpg',
    ],
    'Punch': [
      '/uploads/vehicles/2/punch-front-new.jpg',
      '/uploads/vehicles/tata-punch-1.jpg',
      '/uploads/vehicles/tata-punch-2.jpg',
    ],
    'Tiago': [
      '/uploads/vehicles/3/tiago-front-new.jpg',
      '/uploads/vehicles/tata-tiago-1.jpg',
      '/uploads/vehicles/tata-tiago-2.jpg',
    ],
    'Altroz': [
      '/uploads/vehicles/6/altroz-front.jpg',
      '/uploads/vehicles/tata-altroz-1.jpg',
      '/uploads/vehicles/tata-altroz-2.jpg',
    ],
    'Harrier': [
      '/uploads/vehicles/5/harrier-front.jpg',
      '/uploads/vehicles/tata-harrier-1.jpg',
      '/uploads/vehicles/tata-harrier-2.jpg',
    ],
    'Safari': [
      '/uploads/vehicles/tata-safari-1.jpg',
      '/uploads/vehicles/tata-safari-2.jpg',
      '/uploads/vehicles/tata-safari-3.jpg',
    ],
  }

  const images = vehicleImageMap[model as keyof typeof vehicleImageMap] || []
  
  for (let i = 0; i < images.length; i++) {
    await prisma.vehicleImage.create({
      data: {
        vehicleId,
        imageUrl: images[i],
        altText: `Tata ${model} - View ${i + 1}`,
        isPrimary: i === 0,
        order: i,
      },
    })
  }
}

async function seedVehiclePricing(vehicleId: string, basePrice: number) {
  const taxes = basePrice * 0.14 // 14% tax
  const fees = 5000 // Fixed fees
  const totalPrice = basePrice + taxes + fees

  await prisma.vehiclePricing.create({
    data: {
      vehicleId,
      basePrice,
      taxes,
      fees,
      totalPrice,
      currency: 'EGP',
      hasDiscount: false,
    },
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })