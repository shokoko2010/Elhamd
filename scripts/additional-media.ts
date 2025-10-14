import { db } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'

async function createAdditionalMedia() {
  try {
    console.log('🖼️ Creating additional media from existing images...')

    // Find all images in public directory
    const publicDir = path.join(process.cwd(), 'public')
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    
    // List of specific images to add to media
    const imagesToAdd = [
      {
        path: '/uploads/banners/service-banner.jpg',
        category: 'banner',
        title: 'خدمة الصيانة',
        altText: 'لافتة خدمة الصيانة',
        description: 'لافتة دعائية لخدمة الصيانة المتخصصة'
      },
      {
        path: '/uploads/banners/tiago-electric-banner.jpg',
        category: 'banner',
        title: 'تياجو إلكتروني',
        altText: 'سيارة تياجو الكهربائية',
        description: 'إطلاق سيارة تياجو الكهربائية الجديدة'
      },
      {
        path: '/uploads/banners/adventure-banner.jpg',
        category: 'banner',
        title: 'المغامرة',
        altText: 'لافتة المغامرة',
        description: 'استكشف عالم المغامرات مع سياراتنا'
      },
      {
        path: '/uploads/banners/showroom-banner.jpg',
        category: 'banner',
        title: 'معرض السيارات',
        altText: 'معرض الحمد للسيارات',
        description: 'معرضنا الحديث يضم أحدث السيارات'
      },
      {
        path: '/uploads/banners/punch-banner.jpg',
        category: 'banner',
        title: 'تاتا بانش',
        altText: 'سيارة تاتا بانش',
        description: 'سيارة تاتا بانش القوية'
      },
      {
        path: '/uploads/banners/nexon-banner.jpg',
        category: 'banner',
        title: 'تاتا نيكسون',
        altText: 'سيارة تاتا نيكسون',
        description: 'سيارة تاتا نيكسون الرياضية'
      },
      {
        path: '/uploads/banners/electric-banner.jpg',
        category: 'banner',
        title: 'السيارات الكهربائية',
        altText: 'مجموعة السيارات الكهربائية',
        description: 'استكشف مجموعتنا من السيارات الكهربائية'
      },
      {
        path: '/uploads/vehicles/tata-tiago-1.jpg',
        category: 'vehicles',
        title: 'تاتا تياجو',
        altText: 'سيارة تاتا تياجو',
        description: 'سيارة تاتا تياجو الأنيقة'
      },
      {
        path: '/uploads/vehicles/tata-tiago-2.jpg',
        category: 'vehicles',
        title: 'تاتا تياجو داخلي',
        altText: 'تصميم داخلي لسيارة تاتا تياجو',
        description: 'التصميم الداخلي المريح لسيارة تاتا تياجو'
      },
      {
        path: '/uploads/vehicles/tata-safari-3.jpg',
        category: 'vehicles',
        title: 'تاتا سفاري',
        altText: 'سيارة تاتا سفاري',
        description: 'سيارة تاتا سفاري العائلية'
      },
      {
        path: '/uploads/vehicles/tata-nexon-2.jpg',
        category: 'vehicles',
        title: 'تاتا نيكسون جانبية',
        altText: 'منظر جانبي لسيارة تاتا نيكسون',
        description: 'التصميم الرياضي لسيارة تاتا نيكسون'
      },
      {
        path: '/uploads/vehicles/tata-punch-2.jpg',
        category: 'vehicles',
        title: 'تاتا بانش',
        altText: 'سيارة تاتا بانش المدمجة',
        description: 'سيارة تاتا بانش العملية والمدمجة'
      },
      {
        path: '/uploads/vehicles/tata-harrier-2.jpg',
        category: 'vehicles',
        title: 'تاتا هارير',
        altText: 'سيارة تاتا هارير الفاخرة',
        description: 'سيارة تاتا هارير الفاخرة والعصرية'
      },
      {
        path: '/slider-nexon.jpg',
        category: 'banner',
        title: 'نيكسون رياضي',
        altText: 'سيارة نيكسون الرياضية',
        description: 'تصميم نيكسون الرياضي العصري'
      }
    ]

    // Get admin user for createdBy
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.error('❌ No admin user found')
      return
    }

    console.log(`📝 Found ${imagesToAdd.length} images to add`)

    for (const image of imagesToAdd) {
      try {
        // Check if media already exists
        const existingMedia = await db.media.findFirst({
          where: { url: image.path }
        })

        if (existingMedia) {
          console.log(`⚠️ Media already exists: ${image.path}`)
          continue
        }

        // Create media record
        const mediaData = {
          filename: path.basename(image.path),
          originalName: path.basename(image.path),
          path: image.path,
          url: image.path,
          thumbnailUrl: image.path,
          mimeType: `image/${path.extname(image.path).slice(1)}`,
          size: Math.floor(Math.random() * 500000) + 100000, // Random size between 100KB-500KB
          width: 1200,
          height: 800,
          altText: image.altText,
          title: image.title,
          description: image.description,
          tags: JSON.stringify([image.category, 'tata', 'elhamd']),
          category: image.category,
          entityId: null,
          isPublic: true,
          isFeatured: image.category === 'banner',
          order: 0,
          metadata: JSON.stringify({ source: 'existing', autoGenerated: true }),
          createdBy: adminUser.id
        }

        await db.media.create({
          data: mediaData
        })

        console.log(`✅ Created media: ${image.title}`)
      } catch (error) {
        console.error(`❌ Error creating media for ${image.path}:`, error)
      }
    }

    // Count total media
    const totalMedia = await db.media.count()
    console.log(`📊 Total media in database: ${totalMedia}`)

    // Get media by category
    const mediaByCategory = await db.media.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    })

    console.log('📁 Media by category:')
    mediaByCategory.forEach(cat => {
      console.log(`  ${cat.category}: ${cat._count.id} files`)
    })

    console.log('✅ Additional media creation completed successfully')
  } catch (error) {
    console.error('❌ Error creating additional media:', error)
  } finally {
    await db.$disconnect()
  }
}

createAdditionalMedia()