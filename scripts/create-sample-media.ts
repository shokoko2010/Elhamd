import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSampleMedia() {
  try {
    console.log('Creating sample media files...')

    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (!admin) {
      console.error('Admin user not found')
      return
    }

    // Create sample media files
    const mediaFiles = [
      {
        id: 'media1',
        filename: 'nexon-hero.webp',
        originalName: 'nexon-hero.jpg',
        path: '/uploads/vehicles/1/nexon-front.jpg',
        url: '/uploads/vehicles/1/nexon-front.jpg',
        thumbnailUrl: '/uploads/vehicles/1/nexon-front.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        width: 1920,
        height: 1080,
        altText: 'تاتا نيكسون - صورة رئيسية',
        title: 'تاتا نيكسون',
        description: 'صورة رئيسية لتاتا نيكسون',
        tags: JSON.stringify(['تاتا', 'نيكسون', 'SUV', 'سيارة']),
        category: 'vehicles',
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
      {
        id: 'media2',
        filename: 'showroom-luxury.webp',
        originalName: 'showroom-luxury.jpg',
        path: '/uploads/showroom-luxury.jpg',
        url: '/uploads/showroom-luxury.jpg',
        thumbnailUrl: '/uploads/showroom-luxury.jpg',
        mimeType: 'image/jpeg',
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
      {
        id: 'media3',
        filename: 'service-center.webp',
        originalName: 'service-center.jpg',
        path: '/uploads/dealership-exterior.jpg',
        url: '/uploads/dealership-exterior.jpg',
        thumbnailUrl: '/uploads/dealership-exterior.jpg',
        mimeType: 'image/jpeg',
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
      {
        id: 'media4',
        filename: 'punch-city.webp',
        originalName: 'punch-city.jpg',
        path: '/uploads/vehicles/2/punch-front.jpg',
        url: '/uploads/vehicles/2/punch-front.jpg',
        thumbnailUrl: '/uploads/vehicles/2/punch-front.jpg',
        mimeType: 'image/jpeg',
        size: 819200,
        width: 1920,
        height: 1080,
        altText: 'تاتا بانش في المدينة',
        title: 'تاتا بانش',
        description: 'صورة لتاتا بانش في بيئة حضرية',
        tags: JSON.stringify(['تاتا', 'بانش', 'مدينة', 'سيارة']),
        category: 'vehicles',
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
        createdBy: admin.id,
      },
      {
        id: 'media5',
        filename: 'tiago-electric.webp',
        originalName: 'tiago-electric.jpg',
        path: '/uploads/vehicles/3/tiago-front.jpg',
        url: '/uploads/vehicles/3/tiago-front.jpg',
        thumbnailUrl: '/uploads/vehicles/3/tiago-front.jpg',
        mimeType: 'image/jpeg',
        size: 1228800,
        width: 1920,
        height: 1080,
        altText: 'تاتا تياجو إلكتريك',
        title: 'تاتا تياجو إلكتريك',
        description: 'صورة لتاتا تياجو الكهربائية',
        tags: JSON.stringify(['تاتا', 'تياجو', 'إلكتريك', 'سيارة']),
        category: 'vehicles',
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
        createdBy: admin.id,
      },
      {
        id: 'media6',
        filename: 'banner-nexon.webp',
        originalName: 'banner-nexon.jpg',
        path: '/uploads/banners/nexon-banner.jpg',
        url: '/uploads/banners/nexon-banner.jpg',
        thumbnailUrl: '/uploads/banners/nexon-banner.jpg',
        mimeType: 'image/jpeg',
        size: 1843200,
        width: 1920,
        height: 600,
        altText: 'بانر تاتا نيكسون',
        title: 'بانر تاتا نيكسون',
        description: 'بانر دعائي لتاتا نيكسون',
        tags: JSON.stringify(['تاتا', 'نيكسون', 'بانر', 'إعلان']),
        category: 'company',
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
      {
        id: 'media7',
        filename: 'altroz-premium.webp',
        originalName: 'altroz-premium.jpg',
        path: '/uploads/vehicles/6/altroz-front.jpg',
        url: '/uploads/vehicles/6/altroz-front.jpg',
        thumbnailUrl: '/uploads/vehicles/6/altroz-front.jpg',
        mimeType: 'image/jpeg',
        size: 2252800,
        width: 1920,
        height: 1080,
        altText: 'تاتا ألتروز بريميوم',
        title: 'تاتا ألتروز',
        description: 'صورة لتاتا ألتروز الفاخرة',
        tags: JSON.stringify(['تاتا', 'ألتروز', 'بريميوم', 'سيارة']),
        category: 'vehicles',
        isPublic: true,
        isFeatured: true,
        order: 7,
        metadata: JSON.stringify({
          originalSize: 4505600,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#0000ff'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: admin.id,
      },
      {
        id: 'media8',
        filename: 'harrier-suv.webp',
        originalName: 'harrier-suv.jpg',
        path: '/uploads/vehicles/5/harrier-front.jpg',
        url: '/uploads/vehicles/5/harrier-front.jpg',
        thumbnailUrl: '/uploads/vehicles/5/harrier-front.jpg',
        mimeType: 'image/jpeg',
        size: 2662400,
        width: 1920,
        height: 1080,
        altText: 'تاتا هارير SUV',
        title: 'تاتا هارير',
        description: 'صورة لتاتا هارير الرياضية',
        tags: JSON.stringify(['تاتا', 'هارير', 'SUV', 'رياضية']),
        category: 'vehicles',
        isPublic: true,
        isFeatured: true,
        order: 8,
        metadata: JSON.stringify({
          originalSize: 5324800,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#ff6600'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: admin.id,
      },
      {
        id: 'media9',
        filename: 'tigor-sedan.webp',
        originalName: 'tigor-sedan.jpg',
        path: '/uploads/vehicles/4/tigor-front.jpg',
        url: '/uploads/vehicles/4/tigor-front.jpg',
        thumbnailUrl: '/uploads/vehicles/4/tigor-front.jpg',
        mimeType: 'image/jpeg',
        size: 2048000,
        width: 1920,
        height: 1080,
        altText: 'تاتا تيغور سيدان',
        title: 'تاتا تيغور',
        description: 'صورة لتاتا تيغور الأنيقة',
        tags: JSON.stringify(['تاتا', 'تيغور', 'سيدان', 'أنيقة']),
        category: 'vehicles',
        isPublic: true,
        isFeatured: false,
        order: 9,
        metadata: JSON.stringify({
          originalSize: 4096000,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#9900ff'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: admin.id,
      },
      {
        id: 'media10',
        filename: 'service-workshop.webp',
        originalName: 'service-workshop.jpg',
        path: '/uploads/dealership-exterior.jpg',
        url: '/uploads/dealership-exterior.jpg',
        thumbnailUrl: '/uploads/dealership-exterior.jpg',
        mimeType: 'image/jpeg',
        size: 1740800,
        width: 1920,
        height: 1080,
        altText: 'ورشة صيانة الحمد',
        title: 'ورشة الصيانة',
        description: 'صورة لورشة الصيانة المجهزة',
        tags: JSON.stringify(['ورشة', 'صيانة', 'الحمد', 'تاتا']),
        category: 'services',
        isPublic: true,
        isFeatured: false,
        order: 10,
        metadata: JSON.stringify({
          originalSize: 3481600,
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
      {
        id: 'media11',
        filename: 'team-photo.webp',
        originalName: 'team-photo.jpg',
        path: '/uploads/showroom-luxury.jpg',
        url: '/uploads/showroom-luxury.jpg',
        thumbnailUrl: '/uploads/showroom-luxury.jpg',
        mimeType: 'image/jpeg',
        size: 1945600,
        width: 1920,
        height: 1080,
        altText: 'فريق عمل الحمد',
        title: 'فريق العمل',
        description: 'صورة لفريق عمل الحمد للسيارات',
        tags: JSON.stringify(['فريق', 'عمل', 'الحمد', 'سيارات']),
        category: 'company',
        isPublic: true,
        isFeatured: false,
        order: 11,
        metadata: JSON.stringify({
          originalSize: 3891200,
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
      {
        id: 'media12',
        filename: 'banner-punch.webp',
        originalName: 'banner-punch.jpg',
        path: '/uploads/banners/punch-banner.jpg',
        url: '/uploads/banners/punch-banner.jpg',
        thumbnailUrl: '/uploads/banners/punch-banner.jpg',
        mimeType: 'image/jpeg',
        size: 1638400,
        width: 1920,
        height: 600,
        altText: 'بانر تاتا بانش',
        title: 'بانر تاتا بانش',
        description: 'بانر دعائي لتاتا بانش',
        tags: JSON.stringify(['تاتا', 'بانش', 'بانر', 'إعلان']),
        category: 'company',
        isPublic: true,
        isFeatured: true,
        order: 12,
        metadata: JSON.stringify({
          originalSize: 3276800,
          compressionRatio: '50.00',
          colors: ['#ffffff', '#000000', '#ff0000'],
          optimization: {
            quality: 85,
            format: 'webp',
            timestamp: Date.now()
          }
        }),
        createdBy: admin.id,
      }
    ]

    // Clear existing media
    await prisma.media.deleteMany()

    // Create new media files
    for (const mediaData of mediaFiles) {
      await prisma.media.create({
        data: mediaData
      })
    }

    console.log(`Created ${mediaFiles.length} sample media files`)

    // Verify creation
    const count = await prisma.media.count()
    console.log(`Total media files in database: ${count}`)

  } catch (error) {
    console.error('Error creating sample media:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleMedia()