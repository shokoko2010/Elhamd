import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedBasicData() {
  console.log('🌱 Starting basic database seeding...')
  
  try {
    // Seed sliders only
    console.log('🎠 Seeding sliders...')
    const sliders = [
      {
        title: 'PRIMA 3328.K - القوة المتفوقة',
        subtitle: 'شاحنة ثقيلة للأعمال الصعبة',
        description: 'شاحنة Tata Motors Prima 3328.K بقوة 269 حصان وعزم دوران 970 نيوتن.متر، مصممة لأصعب المهام',
        imageUrl: '/uploads/banners/heavy-truck-banner.jpg',
        ctaText: 'استكشف الآن',
        ctaLink: '/vehicles/PRIMA-3328.K',
        badge: 'شاحنة ثقيلة',
        badgeColor: 'bg-blue-600',
        isActive: true,
        order: 1
      },
      {
        title: 'LP 613 - حافلة متعددة الاستخدامات',
        subtitle: 'مثالية للنقل والمواصلات',
        description: 'حافلة تاتا LP 613 بمحرك 130 حصان، مثالية لتنقلات الموظفين والمدارس والرحلات',
        imageUrl: '/uploads/banners/bus-banner.jpg',
        ctaText: 'اعرف المزيد',
        ctaLink: '/vehicles/LP-613',
        badge: 'حافلة',
        badgeColor: 'bg-green-600',
        isActive: true,
        order: 2
      },
      {
        title: 'ULTRA T.9 - الأداء اللوجستي',
        subtitle: 'شاحنة خفيفة متطورة',
        description: 'شاحنة Tata Ultra T.9 بمحرك 155 حصان وتقنية متقدمة للنقل والخدمات اللوجستية',
        imageUrl: '/uploads/banners/logistics-banner.jpg',
        ctaText: 'قدّم الآن',
        ctaLink: '/vehicles/ULTRA-T.9',
        badge: 'شاحنة خفيفة',
        badgeColor: 'bg-orange-600',
        isActive: true,
        order: 3
      }
    ]

    for (const slider of sliders) {
      await prisma.slider.create({ data: slider })
    }

    console.log('✅ Basic seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedBasicData()