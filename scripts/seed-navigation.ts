import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedNavigation() {
  try {
    console.log('🚀 Starting navigation seeding...')

    // Check if navigation items already exist
    const existingItems = await prisma.headerNavigation.count()
    
    if (existingItems > 0) {
      console.log('✅ Navigation items already exist, skipping seeding')
      return
    }

    // Create navigation items
    const navigationItems = [
      {
        id: 'nav-home',
        label: 'الرئيسية',
        href: '/',
        order: 1,
        isVisible: true
      },
      {
        id: 'nav-vehicles',
        label: 'السيارات',
        href: '/vehicles',
        order: 2,
        isVisible: true
      },
      {
        id: 'nav-search',
        label: 'بحث',
        href: '/search',
        order: 3,
        isVisible: true
      },
      {
        id: 'nav-test-drive',
        label: 'قيادة تجريبية',
        href: '/test-drive',
        order: 4,
        isVisible: true
      },
      {
        id: 'nav-service-booking',
        label: 'حجز خدمة',
        href: '/service-booking',
        order: 5,
        isVisible: true
      },
      {
        id: 'nav-consultation',
        label: 'استشارة',
        href: '/consultation',
        order: 6,
        isVisible: true
      },
      {
        id: 'nav-contact',
        label: 'اتصل بنا',
        href: '/contact',
        order: 7,
        isVisible: true
      }
    ]

    // Insert navigation items
    for (const item of navigationItems) {
      await prisma.headerNavigation.create({
        data: item
      })
      console.log(`✅ Created navigation item: ${item.label}`)
    }

    // Also update site settings with navigation
    const existingSettings = await prisma.siteSettings.findFirst()
    
    if (existingSettings) {
      await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          headerSettings: {
            ...(existingSettings.headerSettings as any || {}),
            navigation: navigationItems.map(item => ({
              id: item.id,
              label: item.label,
              href: item.href,
              order: item.order,
              isVisible: item.isVisible
            }))
          }
        }
      })
      console.log('✅ Updated site settings with navigation')
    } else {
      await prisma.siteSettings.create({
        data: {
          id: 'default',
          siteTitle: 'Al-Hamd Cars',
          siteDescription: 'Your Trusted Car Dealership',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          fontFamily: 'Inter',
          contactEmail: 'info@elhamdimport.com',
          headerSettings: {
            navigation: navigationItems.map(item => ({
              id: item.id,
              label: item.label,
              href: item.href,
              order: item.order,
              isVisible: item.isVisible
            }))
          },
          footerSettings: {},
          seoSettings: {}
        }
      })
      console.log('✅ Created site settings with navigation')
    }

    console.log('🎉 Navigation seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding navigation:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedNavigation()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })