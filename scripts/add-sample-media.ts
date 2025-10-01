import { db } from '../src/lib/db'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// Sample media data for Elhamd Imports website
const sampleMediaItems = [
  {
    filename: 'luxury-sedan-1.jpg',
    originalName: 'Luxury Sedan Front View.jpg',
    url: '/images/vehicles/luxury-sedan-1.jpg',
    mimeType: 'image/jpeg',
    size: 245760,
    width: 1920,
    height: 1080,
    altText: 'سيارة سيدان فاخرة - الواجهة الأمامية',
    title: 'سيارة سيدان فاخرة',
    description: 'سيارة سيدان فاخرة بمواصفات عالية وتصميم أنيق',
    tags: JSON.stringify(['سيارة', 'سيدان', 'فاخرة', 'جديدة']),
    category: 'vehicle',
    isPublic: true,
    isFeatured: true,
    order: 1,
    metadata: JSON.stringify({ brand: 'Mercedes', model: 'S-Class', year: 2024 }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3' // Admin user ID
  },
  {
    filename: 'luxury-sedan-2.jpg',
    originalName: 'Luxury Sedan Side View.jpg',
    url: '/images/vehicles/luxury-sedan-2.jpg',
    mimeType: 'image/jpeg',
    size: 262144,
    width: 1920,
    height: 1080,
    altText: 'سيارة سيدان فاخرة - الواجهة الجانبية',
    title: 'سيارة سيدان فاخرة - جانب',
    description: 'تصميم جانبي أنيق للسيارة السيدان الفاخرة',
    tags: JSON.stringify(['سيارة', 'سيدان', 'فاخرة', 'تصميم']),
    category: 'vehicle',
    isPublic: true,
    isFeatured: true,
    order: 2,
    metadata: JSON.stringify({ brand: 'Mercedes', model: 'S-Class', year: 2024 }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'suv-luxury-1.jpg',
    originalName: 'Luxury SUV Front.jpg',
    url: '/images/vehicles/suv-luxury-1.jpg',
    mimeType: 'image/jpeg',
    size: 314572,
    width: 1920,
    height: 1080,
    altText: 'سيارة SUV فاخرة - الواجهة الأمامية',
    title: 'سيارة SUV فاخرة',
    description: 'سيارة SUV عائلية فاخرة بمساحة واسعة',
    tags: JSON.stringify(['سيارة', 'SUV', 'فاخرة', 'عائلية']),
    category: 'vehicle',
    isPublic: true,
    isFeatured: true,
    order: 3,
    metadata: JSON.stringify({ brand: 'BMW', model: 'X7', year: 2024 }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'sports-car-1.jpg',
    originalName: 'Sports Car Dynamic.jpg',
    url: '/images/vehicles/sports-car-1.jpg',
    mimeType: 'image/jpeg',
    size: 294912,
    width: 1920,
    height: 1080,
    altText: 'سيارة رياضية - عرض ديناميكي',
    title: 'سيارة رياضية',
    description: 'سيارة رياضية بأداء عالي وتصميم رياضي',
    tags: JSON.stringify(['سيارة', 'رياضية', 'أداء', 'سرعة']),
    category: 'vehicle',
    isPublic: true,
    isFeatured: true,
    order: 4,
    metadata: JSON.stringify({ brand: 'Porsche', model: '911', year: 2024 }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'showroom-exterior.jpg',
    originalName: 'Elhamd Imports Showroom Exterior.jpg',
    url: '/images/facility/showroom-exterior.jpg',
    mimeType: 'image/jpeg',
    size: 393216,
    width: 1920,
    height: 1080,
    altText: 'واجهة معرض إلهام للسيارات',
    title: 'معرض إلهام للسيارات',
    description: 'الواجهة الخارجية الحديثة لمعرض إلهام للسيارات',
    tags: JSON.stringify(['معرض', 'واجهة', 'مقر', 'إلهام']),
    category: 'gallery',
    isPublic: true,
    isFeatured: true,
    order: 5,
    metadata: JSON.stringify({ type: 'facility', location: 'main' }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'showroom-interior.jpg',
    originalName: 'Elhamd Imports Showroom Interior.jpg',
    url: '/images/facility/showroom-interior.jpg',
    mimeType: 'image/jpeg',
    size: 376832,
    width: 1920,
    height: 1080,
    altText: 'الداخلية الفاخرة لمعرض إلهام للسيارات',
    title: 'قاعة العرض الداخلية',
    description: 'قاعة عرض داخلية فاخرة مع أحدث السيارات',
    tags: JSON.stringify(['معرض', 'داخلية', 'قاعة عرض', 'فاخرة']),
    category: 'gallery',
    isPublic: true,
    isFeatured: true,
    order: 6,
    metadata: JSON.stringify({ type: 'facility', location: 'interior' }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'service-center.jpg',
    originalName: 'Elhamd Service Center.jpg',
    url: '/images/service/service-center.jpg',
    mimeType: 'image/jpeg',
    size: 356352,
    width: 1920,
    height: 1080,
    altText: 'مركز خدمة إلهام للسيارات',
    title: 'مركز الخدمة',
    description: 'مركز خدمة متكامل بأحدث الأجهزة والفنيين المحترفين',
    tags: JSON.stringify(['خدمة', 'صيانة', 'مركز', 'فنيين']),
    category: 'service',
    isPublic: true,
    isFeatured: false,
    order: 7,
    metadata: JSON.stringify({ type: 'service', equipment: 'latest' }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'team-1.jpg',
    originalName: 'Sales Team Member.jpg',
    url: '/images/team/team-1.jpg',
    mimeType: 'image/jpeg',
    size: 147456,
    width: 400,
    height: 400,
    altText: 'عضو فريق المبيعات',
    title: 'فريق المبيعات',
    description: 'أحد أعضاء فريق المبيعات المحترفين',
    tags: JSON.stringify(['فريق', 'مبيعات', 'موظف', 'محترف']),
    category: 'testimonial',
    isPublic: true,
    isFeatured: false,
    order: 8,
    metadata: JSON.stringify({ role: 'sales', department: 'sales' }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'banner-home-1.jpg',
    originalName: 'Homepage Banner 1.jpg',
    url: '/images/banners/banner-home-1.jpg',
    mimeType: 'image/jpeg',
    size: 524288,
    width: 1920,
    height: 600,
    altText: 'بنر الصفحة الرئيسية - أحدث السيارات',
    title: 'بنر الصفحة الرئيسية',
    description: 'استكشف أحدث السيارات الفاخرة في إلهام للسيارات',
    tags: JSON.stringify(['بنر', 'رئيسية', 'عروض', 'سيارات']),
    category: 'banner',
    isPublic: true,
    isFeatured: true,
    order: 9,
    metadata: JSON.stringify({ type: 'banner', position: 'home' }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'banner-offer-1.jpg',
    originalName: 'Special Offer Banner.jpg',
    url: '/images/banners/banner-offer-1.jpg',
    mimeType: 'image/jpeg',
    size: 483328,
    width: 1920,
    height: 600,
    altText: 'بنر العروض الخاصة',
    title: 'عروض خاصة',
    description: 'عروض حصرية على السيارات الفاخرة',
    tags: JSON.stringify(['بنر', 'عروض', 'خصومات', 'حصرية']),
    category: 'banner',
    isPublic: true,
    isFeatured: true,
    order: 10,
    metadata: JSON.stringify({ type: 'banner', position: 'offer' }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'customer-service.jpg',
    originalName: 'Customer Service Desk.jpg',
    url: '/images/service/customer-service.jpg',
    mimeType: 'image/jpeg',
    size: 294912,
    width: 1920,
    height: 1080,
    altText: 'خدمة العملاء في إلهام للسيارات',
    title: 'خدمة العملاء',
    description: 'فريق خدمة العملاء المستعد لتقديم المساعدة',
    tags: JSON.stringify(['خدمة', 'عملاء', 'دعم', 'مساعدة']),
    category: 'service',
    isPublic: true,
    isFeatured: false,
    order: 11,
    metadata: JSON.stringify({ type: 'service', department: 'customer' }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  },
  {
    filename: 'car-delivery.jpg',
    originalName: 'Car Delivery Service.jpg',
    url: '/images/service/car-delivery.jpg',
    mimeType: 'image/jpeg',
    size: 327680,
    width: 1920,
    height: 1080,
    altText: 'خدمة توصيل السيارات',
    title: 'خدمة التوصيل',
    description: 'خدمة توصيل السيارات للعملاء الكرام',
    tags: JSON.stringify(['توصيل', 'خدمة', 'سيارات', 'عملاء']),
    category: 'service',
    isPublic: true,
    isFeatured: false,
    order: 12,
    metadata: JSON.stringify({ type: 'service', category: 'delivery' }),
    createdBy: 'cmg8axofy000rr9nffcwia6l3'
  }
]

async function addSampleMedia() {
  try {
    console.log('🔄 Adding sample media data...')

    // Check if media already exists
    const existingMedia = await db.media.count()
    if (existingMedia > 0) {
      console.log(`ℹ️ Found ${existingMedia} existing media items. Skipping sample data creation.`)
      return
    }

    // Create directories
    const directories = [
      'public/images/vehicles',
      'public/images/facility',
      'public/images/service',
      'public/images/team',
      'public/images/banners',
      'public/uploads/original',
      'public/uploads/optimized',
      'public/uploads/thumbnails'
    ]

    directories.forEach(dir => {
      const fullPath = join(process.cwd(), dir)
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true })
        console.log(`📁 Created directory: ${dir}`)
      }
    })

    // Add sample media items to database
    for (const mediaItem of sampleMediaItems) {
      await db.media.create({
        data: mediaItem
      })
      console.log(`✅ Added media: ${mediaItem.title}`)
    }

    console.log(`🎉 Successfully added ${sampleMediaItems.length} sample media items!`)

  } catch (error) {
    console.error('❌ Error adding sample media:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

// Run the script
addSampleMedia()
  .then(() => {
    console.log('✅ Sample media addition completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed to add sample media:', error)
    process.exit(1)
  })